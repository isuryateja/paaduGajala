import { afterEach, describe, expect, it, vi } from 'vitest';
import { AudioEnginePresets } from '../../domain/audio/audio.presets';
import { AudioEngine } from '../../domain/audio/audio-engine';
import {
  createReverbImpulse,
  getReverbDurationSeconds,
  REVERB_IR_CHANNELS
} from '../../domain/audio/reverb';
import type { VoiceType } from '../../domain/audio/audio.types';
import { REVERB_PRESETS } from '../../domain/audio/audio.types';
import { getImplementedVoiceTypes } from '../../domain/audio/voices';

/**
 * P2A-05 Phase A regression gate — automated checklist.
 *
 * Phase A = reverb foundation with default mix 0 (dry-identical).
 * Phase B (settings/UI/default mix 0.25) stays locked until this suite is green.
 */

function createGainMock() {
  return {
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      cancelScheduledValues: vi.fn()
    },
    connect: vi.fn(),
    disconnect: vi.fn()
  };
}

function createOscillatorMock() {
  return {
    type: 'sine' as OscillatorType,
    frequency: { value: 0, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as (() => void) | null
  };
}

function createBufferSourceMock() {
  return {
    buffer: null as AudioBuffer | null,
    loop: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as (() => void) | null
  };
}

function createBiquadMock() {
  return {
    type: 'lowpass' as BiquadFilterType,
    frequency: { value: 0, setValueAtTime: vi.fn() },
    Q: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn()
  };
}

function createCompressorMock() {
  return { connect: vi.fn(), disconnect: vi.fn() };
}

function createConvolverMock() {
  return { buffer: null as AudioBuffer | null, connect: vi.fn(), disconnect: vi.fn() };
}

/** Full init surface: reverb graph + voice factories (partials, noise, LFO). */
function installMockAudioContext(sampleRate = 44100): void {
  class AudioContextMock {
    sampleRate = sampleRate;
    state: AudioContextState = 'running';
    destination = { connect: vi.fn(), disconnect: vi.fn() };
    currentTime = 0;

    createGain() {
      return createGainMock();
    }
    createDynamicsCompressor() {
      return createCompressorMock();
    }
    createConvolver() {
      return createConvolverMock();
    }
    createOscillator() {
      return createOscillatorMock();
    }
    createBufferSource() {
      return createBufferSourceMock();
    }
    createBiquadFilter() {
      return createBiquadMock();
    }
    createBuffer(channelCount: number, length: number, rate: number): AudioBuffer {
      const channels = Array.from({ length: channelCount }, () => new Float32Array(length));
      return {
        numberOfChannels: channelCount,
        length,
        sampleRate: rate,
        duration: length / rate,
        getChannelData: (ch: number) => channels[ch]
      } as AudioBuffer;
    }
    resume = vi.fn(async () => {
      this.state = 'running';
    });
  }

  // @ts-expect-error test double
  window.AudioContext = AudioContextMock;
  // @ts-expect-error safari alias
  window.webkitAudioContext = undefined;
}

const PRESET_VOICE: Record<string, VoiceType> = {
  flute: 'flute',
  veena: 'plucked',
  violin: 'bow',
  harmonium: 'reed'
};

describe('Phase 2 / Phase A regression gate (P2A-05)', () => {
  afterEach(() => {
    // @ts-expect-error cleanup
    delete window.AudioContext;
    // @ts-expect-error cleanup
    delete window.webkitAudioContext;
  });

  it('ship default is light wet (0.25) with room IR; pure voice (P2B-03)', () => {
    const engine = new AudioEngine();
    expect(engine.config.reverbMix).toBe(0.25);
    expect(engine.config.reverbPreset).toBe('room');
    expect(engine.config.voiceType).toBe('pure');
  });

  it('init builds reverb graph with silent wet and full dry at mix 0', async () => {
    installMockAudioContext();
    const engine = new AudioEngine({ reverbMix: 0 });
    await engine.init();

    expect(engine.voiceBus).not.toBeNull();
    expect(engine.compressor).not.toBeNull();
    expect(engine.dryGain).not.toBeNull();
    expect(engine.sendGain).not.toBeNull();
    expect(engine.convolver).not.toBeNull();
    expect(engine.wetGain).not.toBeNull();

    // Dry-identical: wet muted, dry unity
    expect(engine.wetGain!.gain.value).toBe(0);
    expect(engine.dryGain!.gain.value).toBe(1);

    // Topology
    expect(engine.voiceBus!.connect).toHaveBeenCalledWith(engine.compressor);
    expect(engine.voiceBus!.connect).toHaveBeenCalledWith(engine.sendGain);
    expect(engine.compressor!.connect).toHaveBeenCalledWith(engine.dryGain);
    expect(engine.dryGain!.connect).toHaveBeenCalledWith(engine.masterGain);
    expect(engine.sendGain!.connect).toHaveBeenCalledWith(engine.convolver);
    expect(engine.convolver!.connect).toHaveBeenCalledWith(engine.wetGain);
    expect(engine.wetGain!.connect).toHaveBeenCalledWith(engine.masterGain);

    // IR present for room
    expect(engine.convolver!.buffer).not.toBeNull();
    expect(engine.convolver!.buffer!.length).toBe(Math.floor(44100 * getReverbDurationSeconds('room')));
  });

  it('playSvara routes every voice onto voiceBus (dry + send feed)', async () => {
    installMockAudioContext();
    const engine = new AudioEngine();
    await engine.init();

    const pure = engine.playSvara('S', 'madhya', 0.4);
    expect(pure).not.toBeNull();
    expect(pure!.voiceGain.connect).toHaveBeenCalledWith(engine.voiceBus);
    expect(pure!.voiceGain.connect).not.toHaveBeenCalledWith(engine.compressor);

    for (const [presetName, expectedVoice] of Object.entries(PRESET_VOICE)) {
      const preset = AudioEnginePresets[presetName];
      if (preset.waveform) engine.setWaveform(preset.waveform);
      if (preset.voiceType) engine.setVoiceType(preset.voiceType);

      const voice = engine.playSvara('P', 'madhya', 0.3);
      expect(voice!.voiceType).toBe(expectedVoice);
      expect(voice!.voiceGain.connect).toHaveBeenCalledWith(engine.voiceBus);
      expect(voice!.sources!.length).toBeGreaterThan(1);
    }
  });

  it('all VoiceTypes remain implemented (Phase 1 regression)', () => {
    expect(getImplementedVoiceTypes().sort()).toEqual(
      ['bow', 'flute', 'plucked', 'pure', 'reed'].sort()
    );
  });

  it('procedural IRs exist for every preset with correct stereo length', () => {
    const sampleRate = 44100;
    for (const preset of REVERB_PRESETS) {
      const channels: Float32Array[] = [];
      const audioContext = {
        sampleRate,
        createBuffer: (channelCount: number, length: number, rate: number): AudioBuffer => {
          channels.length = 0;
          for (let c = 0; c < channelCount; c += 1) {
            channels.push(new Float32Array(length));
          }
          return {
            numberOfChannels: channelCount,
            length,
            sampleRate: rate,
            duration: length / rate,
            getChannelData: (ch: number) => channels[ch] ?? new Float32Array(length),
            copyFromChannel: () => undefined,
            copyToChannel: () => undefined
          } as AudioBuffer;
        }
      };

      const buffer = createReverbImpulse(audioContext, preset);
      expect(buffer.numberOfChannels).toBe(REVERB_IR_CHANNELS);
      expect(buffer.length).toBe(Math.floor(sampleRate * getReverbDurationSeconds(preset)));
      // Non-silent IR
      let max = 0;
      for (const ch of channels) {
        for (let i = 0; i < ch.length; i += 1) {
          max = Math.max(max, Math.abs(ch[i]));
        }
      }
      expect(max).toBeGreaterThan(0);
    }
  });

  it('setReverbMix and setReverbPreset update live graph gains and IR', async () => {
    installMockAudioContext();
    const engine = new AudioEngine();
    await engine.init();

    // Ship default light wet (P2B-03)
    expect(engine.wetGain!.gain.value).toBe(0.25);
    expect(engine.dryGain!.gain.value).toBeCloseTo(0.75);

    engine.setReverbMix(0.5);
    expect(engine.wetGain!.gain.value).toBe(0.5);
    expect(engine.dryGain!.gain.value).toBeCloseTo(0.5);

    // mix=0 still silences wet (dry-identical path remains available)
    engine.setReverbMix(0);
    expect(engine.wetGain!.gain.value).toBe(0);
    expect(engine.dryGain!.gain.value).toBe(1);

    engine.setReverbMix(0.25);
    const roomLen = engine.convolver!.buffer!.length;
    engine.setReverbPreset('concert');
    expect(engine.convolver!.buffer!.length).toBe(
      Math.floor(44100 * getReverbDurationSeconds('concert'))
    );
    expect(engine.convolver!.buffer!.length).toBeGreaterThan(roomLen);
    // Preset switch preserves mix config; wet is ducked then scheduled to restore (PGF-012).
    expect(engine.config.reverbMix).toBe(0.25);
    expect(engine.wetGain!.gain.value).toBe(0);
    expect(engine.wetGain!.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      0.25,
      expect.any(Number)
    );
  });
});
