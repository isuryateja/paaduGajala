import { describe, expect, it, vi } from 'vitest';
import { AudioEnginePresets } from '../../domain/audio/audio.presets';
import { AudioEngine } from '../../domain/audio/audio-engine';
import type { VoiceType } from '../../domain/audio/audio.types';
import { getImplementedVoiceTypes } from '../../domain/audio/voices';

/**
 * P1B-07 Phase B ship gate — automated half of the checklist.
 * Manual listen: apply each preset in the UI and play a short phrase
 * (e.g. `S R2 G2 M1 P`) to confirm instrument character.
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
    frequency: {
      value: 0,
      setValueAtTime: vi.fn()
    },
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

/** Minimal Web Audio surface for all Phase B factories (partials, noise, LFO). */
function primeEngine(engine: AudioEngine): void {
  const channelData = new Float32Array(32);
  engine.audioContext = {
    currentTime: 0,
    sampleRate: 44100,
    createOscillator: vi.fn(() => createOscillatorMock()),
    createGain: vi.fn(() => createGainMock()),
    createBufferSource: vi.fn(() => createBufferSourceMock()),
    createBiquadFilter: vi.fn(() => createBiquadMock()),
    createBuffer: vi.fn(() => ({
      getChannelData: vi.fn(() => channelData)
    }))
  } as unknown as AudioContext;
  engine.voiceBus = createGainMock() as unknown as GainNode;
  engine.compressor = { connect: vi.fn() } as unknown as DynamicsCompressorNode;
  engine.isInitialized = true;
  engine.masterGain = createGainMock() as unknown as GainNode;
}

/** Mirror applyPreset engine wiring (waveform → pure, then voiceType). */
function applyPresetToEngine(engine: AudioEngine, presetName: string): void {
  const preset = AudioEnginePresets[presetName];
  if (preset.waveform) {
    engine.setWaveform(preset.waveform);
  }
  if (preset.masterVolume !== undefined) {
    engine.setVolume(preset.masterVolume);
  }
  if (preset.envelope) {
    engine.setEnvelope(preset.envelope);
  }
  if (preset.voiceType) {
    engine.setVoiceType(preset.voiceType);
  }
}

const PRESET_VOICE: Record<string, VoiceType> = {
  flute: 'flute',
  veena: 'plucked',
  violin: 'bow',
  harmonium: 'reed'
};

describe('Phase 1 / Phase B ship gate (P1B-07)', () => {
  it('all VoiceTypes are implemented (no pure fallback for instruments)', () => {
    expect(getImplementedVoiceTypes().sort()).toEqual(
      ['bow', 'flute', 'plucked', 'pure', 'reed'].sort()
    );
  });

  it('each instrument preset maps to an additive voice and multi-source note', () => {
    for (const [presetName, expectedVoice] of Object.entries(PRESET_VOICE)) {
      const engine = new AudioEngine();
      primeEngine(engine);
      applyPresetToEngine(engine, presetName);

      expect(engine.config.voiceType).toBe(expectedVoice);
      expect(AudioEnginePresets[presetName].voiceType).toBe(expectedVoice);

      const voice = engine.playSvara('S', 'madhya', 0.5, 0.8);
      expect(voice).not.toBeNull();
      expect(voice!.voiceType).toBe(expectedVoice);
      expect(voice!.sources!.length).toBeGreaterThan(1);
      expect(voice!.voiceGain.connect).toHaveBeenCalledWith(engine.voiceBus);
    }
  });

  it('manual waveform path forces pure single-osc after an instrument preset', () => {
    const engine = new AudioEngine();
    primeEngine(engine);
    applyPresetToEngine(engine, 'violin');
    expect(engine.config.voiceType).toBe('bow');

    engine.setWaveform('triangle');
    expect(engine.config.voiceType).toBe('pure');

    const voice = engine.playSvara('P', 'madhya', 0.4);
    expect(voice!.voiceType).toBe('pure');
    expect(voice!.sources).toHaveLength(1);
  });
});
