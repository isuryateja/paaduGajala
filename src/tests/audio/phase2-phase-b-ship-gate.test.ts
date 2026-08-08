import { afterEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { updateReverbMix, updateReverbPreset } from '../../app/actions/settings.actions';
import { audioEngine } from '../../app/actions/playback.actions';
import { settingsStore } from '../../app/stores/settings.store';
import { AudioEngine } from '../../domain/audio/audio-engine';
import {
  createReverbImpulse,
  getReverbDurationSeconds,
  REVERB_IR_CHANNELS
} from '../../domain/audio/reverb';
import type { ReverbPreset, VoiceType } from '../../domain/audio/audio.types';
import { REVERB_PRESETS } from '../../domain/audio/audio.types';
import { getImplementedVoiceTypes } from '../../domain/audio/voices';
import {
  DEFAULT_REVERB_MIX,
  DEFAULT_REVERB_PRESET
} from '../../domain/shared/constants';

/**
 * P2B-04 Phase B ship gate — automated half of the checklist.
 *
 * Manual listen checklist (main player Tone & Tuning):
 * 1. Dry: reverb mix 0% — dry-identical / no tail.
 * 2. Wet: mix ~25% (ship default) and 50%+ — audible space.
 * 3. Each Space preset: room (short), hall (medium), concert (long) while playing e.g. `S R2 G2 M1 P`.
 * 4. Switch Space mid-phrase — no hard click / mix preserved.
 * 5. Instrument presets still characterful with light reverb.
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

describe('Phase 2 / Phase B ship gate (P2B-04)', () => {
  afterEach(() => {
    // @ts-expect-error cleanup
    delete window.AudioContext;
    // @ts-expect-error cleanup
    delete window.webkitAudioContext;

    settingsStore.set({
      tempo: 120,
      volume: 0.7,
      waveform: 'triangle',
      tuning: 'equal',
      preset: 'veena',
      reverbMix: DEFAULT_REVERB_MIX,
      reverbPreset: DEFAULT_REVERB_PRESET
    });
    audioEngine.setReverbMix(DEFAULT_REVERB_MIX);
    audioEngine.setReverbPreset(DEFAULT_REVERB_PRESET);
  });

  it('ship defaults: mix 0.25, room preset, constants aligned', () => {
    expect(DEFAULT_REVERB_MIX).toBe(0.25);
    expect(DEFAULT_REVERB_PRESET).toBe('room');

    const engine = new AudioEngine();
    expect(engine.config.reverbMix).toBe(0.25);
    expect(engine.config.reverbPreset).toBe('room');

    expect(get(settingsStore).reverbMix).toBe(0.25);
    expect(get(settingsStore).reverbPreset).toBe('room');
  });

  it('dry vs wet: mix 0 silences wet; mix > 0 opens wet with linear dry/wet', async () => {
    installMockAudioContext();
    const engine = new AudioEngine({ reverbMix: 0 });
    await engine.init();

    expect(engine.wetGain!.gain.value).toBe(0);
    expect(engine.dryGain!.gain.value).toBe(1);

    engine.setReverbMix(0.25);
    expect(engine.wetGain!.gain.value).toBe(0.25);
    expect(engine.dryGain!.gain.value).toBeCloseTo(0.75);

    engine.setReverbMix(1);
    expect(engine.wetGain!.gain.value).toBe(1);
    expect(engine.dryGain!.gain.value).toBe(0);
  });

  it('each IR preset has distinct stereo length (room / hall / concert)', () => {
    const ctx = {
      sampleRate: 44100,
      createBuffer: (channels: number, length: number, rate: number) => {
        const data = Array.from({ length: channels }, () => new Float32Array(length));
        return {
          numberOfChannels: channels,
          length,
          sampleRate: rate,
          duration: length / rate,
          getChannelData: (ch: number) => data[ch]
        } as AudioBuffer;
      }
    };

    const lengths: number[] = [];
    for (const preset of REVERB_PRESETS) {
      const buffer = createReverbImpulse(ctx, preset);
      expect(buffer.numberOfChannels).toBe(REVERB_IR_CHANNELS);
      expect(buffer.length).toBe(Math.floor(44100 * getReverbDurationSeconds(preset)));
      lengths.push(buffer.length);

      let max = 0;
      for (let c = 0; c < buffer.numberOfChannels; c += 1) {
        const ch = buffer.getChannelData(c);
        for (let i = 0; i < ch.length; i += 1) {
          max = Math.max(max, Math.abs(ch[i]));
        }
      }
      expect(max).toBeGreaterThan(0);
    }

    // room < hall < concert
    expect(lengths[0]).toBeLessThan(lengths[1]);
    expect(lengths[1]).toBeLessThan(lengths[2]);
  });

  it('live graph loads each IR and preserves mix on preset switch', async () => {
    installMockAudioContext();
    const engine = new AudioEngine({ reverbMix: 0.35, reverbPreset: 'room' });
    await engine.init();

    for (const preset of REVERB_PRESETS as readonly ReverbPreset[]) {
      const changed = preset !== engine.config.reverbPreset;
      engine.setReverbPreset(preset);
      expect(engine.config.reverbPreset).toBe(preset);
      expect(engine.convolver!.buffer!.length).toBe(
        Math.floor(44100 * getReverbDurationSeconds(preset))
      );
      // Config mix is preserved; live wet is ducked then scheduled to restore on change (PGF-012).
      expect(engine.config.reverbMix).toBe(0.35);
      if (changed) {
        expect(engine.wetGain!.gain.value).toBe(0);
        expect(engine.wetGain!.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
          0.35,
          expect.any(Number)
        );
      }
    }
  });

  it('settings actions drive engine mix and preset (store ↔ engine)', () => {
    updateReverbMix(0.4);
    expect(get(settingsStore).reverbMix).toBe(0.4);
    expect(audioEngine.config.reverbMix).toBe(0.4);

    updateReverbPreset('hall');
    expect(get(settingsStore).reverbPreset).toBe('hall');
    expect(audioEngine.config.reverbPreset).toBe('hall');

    updateReverbMix(2);
    expect(get(settingsStore).reverbMix).toBe(1);
  });

  it('main player UI wires reverb controls to settings actions', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/+page.svelte'), 'utf8');
    expect(source).toContain('updateReverbMix');
    expect(source).toContain('updateReverbPreset');
    expect(source).toContain('$settingsStore.reverbMix');
    expect(source).toContain('$settingsStore.reverbPreset');
    expect(source).toContain('id="reverb-range"');
    expect(source).toContain('id="reverb-preset-select"');
  });

  it('Phase 1 voices still land on voiceBus (dry + send feed)', async () => {
    installMockAudioContext();
    expect(getImplementedVoiceTypes().sort()).toEqual(
      ['bow', 'flute', 'plucked', 'pure', 'reed'].sort()
    );

    for (const voiceType of getImplementedVoiceTypes() as VoiceType[]) {
      const engine = new AudioEngine({ voiceType, reverbMix: 0.25 });
      await engine.init();
      const voice = engine.playSvara('S', 'madhya', 0.3, 0.8);
      expect(voice).not.toBeNull();
      expect(voice!.voiceGain.connect).toHaveBeenCalledWith(engine.voiceBus);
    }
  });

  it('graph topology: voiceBus → dry+wet; convolver on send path only', async () => {
    installMockAudioContext();
    const engine = new AudioEngine();
    await engine.init();

    expect(engine.voiceBus!.connect).toHaveBeenCalledWith(engine.compressor);
    expect(engine.voiceBus!.connect).toHaveBeenCalledWith(engine.sendGain);
    expect(engine.sendGain!.connect).toHaveBeenCalledWith(engine.convolver);
    expect(engine.convolver!.connect).toHaveBeenCalledWith(engine.wetGain);
    expect(engine.wetGain!.connect).toHaveBeenCalledWith(engine.masterGain);
    expect(engine.dryGain!.connect).toHaveBeenCalledWith(engine.masterGain);
  });
});
