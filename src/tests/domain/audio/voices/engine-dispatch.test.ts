import { describe, expect, it, vi } from 'vitest';
import { AudioEngine } from '../../../../domain/audio/audio-engine';

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

/**
 * Wire a minimal AudioContext + voiceBus so engine.createVoice can run
 * without a real Web Audio implementation (jsdom).
 */
function primeEngineForVoiceCreation(engine: AudioEngine): {
  oscillators: ReturnType<typeof createOscillatorMock>[];
  voiceBus: ReturnType<typeof createGainMock>;
} {
  const oscillators: ReturnType<typeof createOscillatorMock>[] = [];
  const voiceBus = createGainMock();

  engine.audioContext = {
    currentTime: 0,
    createOscillator: vi.fn(() => {
      const osc = createOscillatorMock();
      oscillators.push(osc);
      return osc;
    }),
    createGain: vi.fn(() => createGainMock())
  } as unknown as AudioContext;
  engine.voiceBus = voiceBus as unknown as GainNode;
  engine.compressor = { connect: vi.fn() } as unknown as DynamicsCompressorNode;
  engine.isInitialized = true;
  engine.masterGain = createGainMock() as unknown as GainNode;

  return { oscillators, voiceBus };
}

describe('AudioEngine voice dispatch (P1A-04 / P1B-01 / P2A-04)', () => {
  it('playSvara creates a pure voice via the dispatcher and tracks it', () => {
    const engine = new AudioEngine({ waveform: 'triangle' });
    const primed = primeEngineForVoiceCreation(engine);

    const voice = engine.playSvara('S', 'madhya', 1, 0.9);
    const oscillator = primed.oscillators[0];

    expect(voice).not.toBeNull();
    expect(voice!.voiceType).toBe('pure');
    expect(voice!.svara).toBe('S');
    expect(voice!.octave).toBe('madhya');
    expect(voice!.oscillator).toBeDefined();
    expect(voice!.sources).toHaveLength(1);
    expect(oscillator.type).toBe('triangle');
    expect(oscillator.start).toHaveBeenCalled();
    // Voices land on voiceBus (dry + reverb send split) — P2A-04.
    expect(voice!.voiceGain.connect).toHaveBeenCalledWith(primed.voiceBus);
    expect(engine.activeVoices.has(voice!.id)).toBe(true);
  });

  it('startSvara (piano sustain path) also routes through dispatcher as pure', () => {
    const engine = new AudioEngine();
    primeEngineForVoiceCreation(engine);

    const voice = engine.startSvara('P', 'taara', 1);

    expect(voice).not.toBeNull();
    expect(voice!.voiceType).toBe('pure');
    expect(voice!.svara).toBe('P');
    expect(voice!.octave).toBe('taara');
    expect(engine.activeVoices.has(voice!.id)).toBe(true);
  });

  it('onEnded removes the voice from activeVoices', () => {
    const engine = new AudioEngine();
    const primed = primeEngineForVoiceCreation(engine);

    const voice = engine.playSvara('R2', 'madhya', 0.5);
    expect(voice).not.toBeNull();
    expect(engine.activeVoices.has(voice!.id)).toBe(true);

    primed.oscillators[0].onended?.();
    expect(engine.activeVoices.has(voice!.id)).toBe(false);
  });

  it('createVoice reads config.voiceType and routes plucked multi-partial bank', () => {
    const engine = new AudioEngine({ voiceType: 'plucked' });
    primeEngineForVoiceCreation(engine);

    expect(engine.config.voiceType).toBe('plucked');
    const voice = engine.playSvara('S', 'madhya', 1);
    expect(voice!.voiceType).toBe('plucked');
    expect(voice!.sources!.length).toBeGreaterThan(1);
  });

  it('setVoiceType routes bow multi-partial bank with LFO', () => {
    const engine = new AudioEngine();
    primeEngineForVoiceCreation(engine);

    engine.setVoiceType('bow');
    expect(engine.config.voiceType).toBe('bow');
    const voice = engine.playSvara('G2', 'madhya', 0.5);
    expect(voice!.voiceType).toBe('bow');
    expect(voice!.sources!.length).toBeGreaterThan(1);
  });

  it('setVoiceType routes reed multi-partial bank', () => {
    const engine = new AudioEngine();
    primeEngineForVoiceCreation(engine);

    engine.setVoiceType('reed');
    expect(engine.config.voiceType).toBe('reed');
    const voice = engine.playSvara('G2', 'madhya', 0.5);
    expect(voice!.voiceType).toBe('reed');
    expect(voice!.sources!.length).toBeGreaterThan(1);
  });
});
