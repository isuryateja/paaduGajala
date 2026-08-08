import { describe, expect, it, vi } from 'vitest';
import {
  createVoiceByType,
  getImplementedVoiceTypes
} from '../../../../domain/audio/voices';
import type { VoiceCreateContext, VoiceCreateParams } from '../../../../domain/audio/voices/types';

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

function createMockContext(): VoiceCreateContext {
  const channelData = new Float32Array(32);
  const audioContext = {
    currentTime: 0,
    sampleRate: 44100,
    createOscillator: vi.fn(() => createOscillatorMock()),
    createGain: vi.fn(() => createGainMock()),
    createBufferSource: vi.fn(() => createBufferSourceMock()),
    createBiquadFilter: vi.fn(() => createBiquadMock()),
    createBuffer: vi.fn(() => ({
      getChannelData: vi.fn(() => channelData)
    }))
  };

  return {
    audioContext: audioContext as unknown as AudioContext,
    destination: { connect: vi.fn() } as unknown as AudioNode,
    envelope: { attack: 0.02, decay: 0.05, sustain: 0.7, release: 0.15 },
    waveform: 'sine'
  };
}

const baseParams: VoiceCreateParams = {
  id: 'voice-dispatch-1',
  frequency: 261.63,
  startTime: 0,
  durationSeconds: 0.5,
  velocity: 1,
  svara: 'S',
  octave: 'madhya'
};

describe('createVoiceByType dispatcher (P1A-03 / Phase B)', () => {
  it('lists all VoiceTypes as implemented after P1B-04', () => {
    expect(getImplementedVoiceTypes()).toEqual(['pure', 'plucked', 'flute', 'bow', 'reed']);
  });

  it('routes pure to the pure single-oscillator factory', () => {
    const voice = createVoiceByType('pure', createMockContext(), baseParams);

    expect(voice.voiceType).toBe('pure');
    expect(voice.id).toBe('voice-dispatch-1');
    expect(voice.oscillator).toBeDefined();
    expect(voice.sources).toHaveLength(1);
  });

  it('routes plucked to the multi-partial plucked-string factory', () => {
    const voice = createVoiceByType('plucked', createMockContext(), {
      ...baseParams,
      id: 'voice-plucked'
    });

    expect(voice.voiceType).toBe('plucked');
    expect(voice.sources?.length).toBeGreaterThan(1);
  });

  it('routes flute to the flute factory with partials + noise', () => {
    const voice = createVoiceByType('flute', createMockContext(), {
      ...baseParams,
      id: 'voice-flute'
    });

    expect(voice.voiceType).toBe('flute');
    expect(voice.sources?.length).toBeGreaterThan(1);
  });

  it('routes bow to the multi-partial bow factory with LFO', () => {
    const voice = createVoiceByType('bow', createMockContext(), {
      ...baseParams,
      id: 'voice-bow'
    });

    expect(voice.voiceType).toBe('bow');
    expect(voice.sources?.length).toBeGreaterThan(1);
  });

  it('routes reed to the multi-partial reed factory', () => {
    const voice = createVoiceByType('reed', createMockContext(), {
      ...baseParams,
      id: 'voice-reed'
    });

    expect(voice.voiceType).toBe('reed');
    expect(voice.sources?.length).toBeGreaterThan(1);
  });
});
