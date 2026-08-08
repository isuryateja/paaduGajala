import { describe, expect, it, vi } from 'vitest';
import {
  createReedVoice,
  REED_MIN_ATTACK,
  REED_PARTIAL_COUNT,
  REED_PARTIAL_WEIGHTS
} from '../../../../domain/audio/voices/reed';
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

function createMockContext(overrides: Partial<VoiceCreateContext> = {}): {
  context: VoiceCreateContext;
  oscillators: ReturnType<typeof createOscillatorMock>[];
  envelopeGain: ReturnType<typeof createGainMock>;
  voiceGain: ReturnType<typeof createGainMock>;
  destination: { connect: ReturnType<typeof vi.fn> };
} {
  const oscillators: ReturnType<typeof createOscillatorMock>[] = [];
  const envelopeGain = createGainMock();
  const voiceGain = createGainMock();
  const destination = { connect: vi.fn() };
  let gainCalls = 0;

  const audioContext = {
    currentTime: 10,
    sampleRate: 44100,
    createOscillator: vi.fn(() => {
      const osc = createOscillatorMock();
      oscillators.push(osc);
      return osc;
    }),
    createGain: vi.fn(() => {
      gainCalls += 1;
      if (gainCalls === 1) return envelopeGain;
      if (gainCalls === 2) return voiceGain;
      return createGainMock();
    })
  };

  const context: VoiceCreateContext = {
    audioContext: audioContext as unknown as AudioContext,
    destination: destination as unknown as AudioNode,
    // Snappy attack below REED_MIN_ATTACK to prove the floor applies.
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.2 },
    waveform: 'sine',
    ...overrides
  };

  return { context, oscillators, envelopeGain, voiceGain, destination };
}

const baseParams: VoiceCreateParams = {
  id: 'voice-reed-1',
  frequency: 440,
  startTime: 10,
  durationSeconds: 1,
  velocity: 0.55,
  svara: 'S',
  octave: 'madhya'
};

describe('createReedVoice (P1B-04)', () => {
  it(`builds ${REED_PARTIAL_COUNT} partials with strong odd harmonics`, () => {
    const { context, oscillators, voiceGain, destination, envelopeGain } = createMockContext();

    const voice = createReedVoice(context, baseParams);

    expect(voice.voiceType).toBe('reed');
    expect(voice.id).toBe('voice-reed-1');
    expect(voice.sources).toHaveLength(REED_PARTIAL_COUNT);
    expect(oscillators).toHaveLength(REED_PARTIAL_COUNT);
    expect(voice.oscillator).toBe(oscillators[0]);
    expect(voiceGain.gain.value).toBe(0.55);
    expect(voiceGain.connect).toHaveBeenCalledWith(destination);

    for (let i = 0; i < REED_PARTIAL_COUNT; i += 1) {
      expect(oscillators[i].type).toBe('sine');
      expect(oscillators[i].frequency.value).toBeCloseTo(440 * (i + 1), 5);
      expect(oscillators[i].start).toHaveBeenCalledWith(10);
      expect(REED_PARTIAL_WEIGHTS[i]).toBeGreaterThan(0);
    }

    // Stronger odds than neighboring evens (square-ish reed stack).
    expect(REED_PARTIAL_WEIGHTS[2]).toBeGreaterThan(REED_PARTIAL_WEIGHTS[1]); // 3 > 2
    expect(REED_PARTIAL_WEIGHTS[4]).toBeGreaterThan(REED_PARTIAL_WEIGHTS[3]); // 5 > 4
    expect(REED_PARTIAL_WEIGHTS[6]).toBeGreaterThan(REED_PARTIAL_WEIGHTS[5]); // 7 > 6
    // Evens stay low relative to the fundamental.
    expect(REED_PARTIAL_WEIGHTS[1]).toBeLessThan(0.2);
    expect(REED_PARTIAL_WEIGHTS[3]).toBeLessThan(0.15);

    // Medium attack floor (0.01 → REED_MIN_ATTACK).
    expect(envelopeGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      1,
      10 + REED_MIN_ATTACK
    );
  });

  it('stop() releases and stops every partial', () => {
    const { context, oscillators, envelopeGain } = createMockContext();
    const voice = createReedVoice(context, baseParams);

    for (const osc of oscillators) {
      osc.stop.mockClear();
    }
    envelopeGain.gain.cancelScheduledValues.mockClear();
    envelopeGain.gain.linearRampToValueAtTime.mockClear();

    voice.stop(10.5);

    expect(envelopeGain.gain.cancelScheduledValues).toHaveBeenCalledWith(10.5);
    expect(envelopeGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.0001, 10.7);
    for (const osc of oscillators) {
      expect(osc.stop).toHaveBeenCalledWith(10.7);
    }
  });

  it('onEnded fires once after all partials end', () => {
    const onEnded = vi.fn();
    const { context, oscillators, envelopeGain, voiceGain } = createMockContext({ onEnded });

    createReedVoice(context, baseParams);

    for (let i = 0; i < REED_PARTIAL_COUNT - 1; i += 1) {
      oscillators[i].onended?.();
    }
    expect(onEnded).not.toHaveBeenCalled();

    oscillators[REED_PARTIAL_COUNT - 1].onended?.();
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(onEnded).toHaveBeenCalledWith('voice-reed-1');
    expect(envelopeGain.disconnect).toHaveBeenCalled();
    expect(voiceGain.disconnect).toHaveBeenCalled();
  });

  it('setFrequency retunes all harmonic partials', () => {
    const { context, oscillators } = createMockContext();
    const voice = createReedVoice(context, baseParams);

    voice.setFrequency?.(880, 11);

    for (let i = 0; i < REED_PARTIAL_COUNT; i += 1) {
      expect(oscillators[i].frequency.setValueAtTime).toHaveBeenCalledWith(880 * (i + 1), 11);
    }
  });
});
