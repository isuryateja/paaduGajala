import { describe, expect, it, vi } from 'vitest';
import {
  createPluckedStringVoice,
  PLUCKED_INHARMONICITY,
  PLUCKED_PARTIAL_COUNT,
  PLUCKED_PARTIAL_WEIGHTS
} from '../../../../domain/audio/voices/plucked-string';
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
  partialGains: ReturnType<typeof createGainMock>[];
  destination: { connect: ReturnType<typeof vi.fn> };
} {
  const oscillators: ReturnType<typeof createOscillatorMock>[] = [];
  const partialGains: ReturnType<typeof createGainMock>[] = [];
  const envelopeGain = createGainMock();
  const voiceGain = createGainMock();
  const destination = { connect: vi.fn() };
  let gainCalls = 0;

  const audioContext = {
    currentTime: 10,
    createOscillator: vi.fn(() => {
      const osc = createOscillatorMock();
      oscillators.push(osc);
      return osc;
    }),
    createGain: vi.fn(() => {
      gainCalls += 1;
      // partial gains first (one per partial), then envelopeGain, then voiceGain
      if (gainCalls <= PLUCKED_PARTIAL_COUNT) {
        const g = createGainMock();
        partialGains.push(g);
        return g;
      }
      if (gainCalls === PLUCKED_PARTIAL_COUNT + 1) {
        return envelopeGain;
      }
      return voiceGain;
    })
  };

  // Factory creates envelopeGain + voiceGain first, then partials — match real order.
  gainCalls = 0;
  audioContext.createGain = vi.fn(() => {
    gainCalls += 1;
    // createPluckedStringVoice: envelopeGain, voiceGain, then N partial gains
    if (gainCalls === 1) return envelopeGain;
    if (gainCalls === 2) return voiceGain;
    const g = createGainMock();
    partialGains.push(g);
    return g;
  });

  const context: VoiceCreateContext = {
    audioContext: audioContext as unknown as AudioContext,
    destination: destination as unknown as AudioNode,
    envelope: { attack: 0.02, decay: 0.05, sustain: 0.75, release: 0.15 },
    waveform: 'triangle',
    ...overrides
  };

  return { context, oscillators, envelopeGain, voiceGain, partialGains, destination };
}

const baseParams: VoiceCreateParams = {
  id: 'voice-pluck-1',
  frequency: 261.63,
  startTime: 10,
  durationSeconds: 1,
  velocity: 0.8,
  svara: 'S',
  octave: 'madhya'
};

describe('createPluckedStringVoice (P1B-01)', () => {
  it(`builds ${PLUCKED_PARTIAL_COUNT} partials with inharmonic frequencies`, () => {
    const { context, oscillators, destination, voiceGain } = createMockContext();

    const voice = createPluckedStringVoice(context, baseParams);

    expect(voice.voiceType).toBe('plucked');
    expect(voice.id).toBe('voice-pluck-1');
    expect(voice.sources).toHaveLength(PLUCKED_PARTIAL_COUNT);
    expect(oscillators).toHaveLength(PLUCKED_PARTIAL_COUNT);
    expect(voice.oscillator).toBe(oscillators[0]);
    expect(voiceGain.gain.value).toBe(0.8);
    expect(voiceGain.connect).toHaveBeenCalledWith(destination);

    for (let i = 0; i < PLUCKED_PARTIAL_COUNT; i += 1) {
      const n = i + 1;
      const expected = 261.63 * n * (1 + PLUCKED_INHARMONICITY * n * n);
      expect(oscillators[i].type).toBe('sine');
      expect(oscillators[i].frequency.value).toBeCloseTo(expected, 5);
      expect(oscillators[i].start).toHaveBeenCalledWith(10);
      expect(PLUCKED_PARTIAL_WEIGHTS[i]).toBeGreaterThan(0);
    }
  });

  it('stop() schedules release and stops every partial oscillator', () => {
    const { context, oscillators, envelopeGain } = createMockContext();
    const voice = createPluckedStringVoice(context, baseParams);

    for (const osc of oscillators) {
      osc.stop.mockClear();
    }
    envelopeGain.gain.cancelScheduledValues.mockClear();
    envelopeGain.gain.linearRampToValueAtTime.mockClear();

    voice.stop(10.5);

    expect(envelopeGain.gain.cancelScheduledValues).toHaveBeenCalledWith(10.5);
    expect(envelopeGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.0001, 10.65);
    for (const osc of oscillators) {
      expect(osc.stop).toHaveBeenCalledWith(10.65);
    }
  });

  it('onEnded fires once after all partials end and disconnects graph', () => {
    const onEnded = vi.fn();
    const { context, oscillators, envelopeGain, voiceGain, partialGains } = createMockContext({
      onEnded
    });

    createPluckedStringVoice(context, baseParams);

    // Fire all but last — no cleanup yet
    for (let i = 0; i < oscillators.length - 1; i += 1) {
      oscillators[i].onended?.();
    }
    expect(onEnded).not.toHaveBeenCalled();

    oscillators[oscillators.length - 1].onended?.();
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(onEnded).toHaveBeenCalledWith('voice-pluck-1');

    for (const osc of oscillators) {
      expect(osc.disconnect).toHaveBeenCalled();
    }
    for (const g of partialGains) {
      expect(g.disconnect).toHaveBeenCalled();
    }
    expect(envelopeGain.disconnect).toHaveBeenCalled();
    expect(voiceGain.disconnect).toHaveBeenCalled();
  });

  it('setFrequency retunes every partial with inharmonicity', () => {
    const { context, oscillators } = createMockContext();
    const voice = createPluckedStringVoice(context, baseParams);

    voice.setFrequency?.(440, 12);

    for (let i = 0; i < PLUCKED_PARTIAL_COUNT; i += 1) {
      const n = i + 1;
      const expected = 440 * n * (1 + PLUCKED_INHARMONICITY * n * n);
      expect(oscillators[i].frequency.setValueAtTime).toHaveBeenCalledWith(expected, 12);
    }
  });
});
