import { describe, expect, it, vi } from 'vitest';
import {
  BOW_LFO_DEPTH,
  BOW_LFO_RATE,
  BOW_MIN_ATTACK,
  BOW_PARTIAL_COUNT,
  BOW_PARTIAL_WEIGHTS,
  createBowVoice
} from '../../../../domain/audio/voices/bow';
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
  tremoloGain: ReturnType<typeof createGainMock>;
  voiceGain: ReturnType<typeof createGainMock>;
  lfoDepth: ReturnType<typeof createGainMock>;
  destination: { connect: ReturnType<typeof vi.fn> };
} {
  const oscillators: ReturnType<typeof createOscillatorMock>[] = [];
  const envelopeGain = createGainMock();
  const tremoloGain = createGainMock();
  const voiceGain = createGainMock();
  const lfoDepth = createGainMock();
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
      // envelope, tremolo, voice, N partials, then lfoDepth
      if (gainCalls === 1) return envelopeGain;
      if (gainCalls === 2) return tremoloGain;
      if (gainCalls === 3) return voiceGain;
      if (gainCalls <= 3 + BOW_PARTIAL_COUNT) return createGainMock();
      return lfoDepth;
    })
  };

  const context: VoiceCreateContext = {
    audioContext: audioContext as unknown as AudioContext,
    destination: destination as unknown as AudioNode,
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.25 },
    waveform: 'sine',
    ...overrides
  };

  return {
    context,
    oscillators,
    envelopeGain,
    tremoloGain,
    voiceGain,
    lfoDepth,
    destination
  };
}

const baseParams: VoiceCreateParams = {
  id: 'voice-bow-1',
  frequency: 440,
  startTime: 10,
  durationSeconds: 1,
  velocity: 0.65,
  svara: 'S',
  octave: 'madhya'
};

describe('createBowVoice (P1B-03)', () => {
  it(`builds ${BOW_PARTIAL_COUNT} odd-emphasized partials plus mild gain LFO`, () => {
    const { context, oscillators, tremoloGain, voiceGain, lfoDepth, destination, envelopeGain } =
      createMockContext();

    const voice = createBowVoice(context, baseParams);

    expect(voice.voiceType).toBe('bow');
    expect(voice.id).toBe('voice-bow-1');
    // N partials + LFO oscillator
    expect(voice.sources).toHaveLength(BOW_PARTIAL_COUNT + 1);
    expect(oscillators).toHaveLength(BOW_PARTIAL_COUNT + 1);
    expect(voice.oscillator).toBe(oscillators[0]);
    expect(voiceGain.gain.value).toBe(0.65);
    expect(voiceGain.connect).toHaveBeenCalledWith(destination);
    expect(tremoloGain.gain.value).toBe(1);

    // Harmonic partials 1..N
    for (let i = 0; i < BOW_PARTIAL_COUNT; i += 1) {
      expect(oscillators[i].type).toBe('sine');
      expect(oscillators[i].frequency.value).toBeCloseTo(440 * (i + 1), 5);
      expect(oscillators[i].start).toHaveBeenCalledWith(10);
      expect(BOW_PARTIAL_WEIGHTS[i]).toBeGreaterThan(0);
    }

    // Odd partials louder than neighboring even (violin-ish stack).
    expect(BOW_PARTIAL_WEIGHTS[2]).toBeGreaterThan(BOW_PARTIAL_WEIGHTS[1]); // 3 > 2
    expect(BOW_PARTIAL_WEIGHTS[4]).toBeGreaterThan(BOW_PARTIAL_WEIGHTS[3]); // 5 > 4
    expect(BOW_PARTIAL_WEIGHTS[6]).toBeGreaterThan(BOW_PARTIAL_WEIGHTS[5]); // 7 > 6

    // LFO is last oscillator
    const lfo = oscillators[BOW_PARTIAL_COUNT];
    expect(lfo.type).toBe('sine');
    expect(lfo.frequency.value).toBe(BOW_LFO_RATE);
    expect(lfo.start).toHaveBeenCalledWith(10);
    expect(lfo.connect).toHaveBeenCalledWith(lfoDepth);
    expect(lfoDepth.gain.value).toBe(BOW_LFO_DEPTH);
    expect(lfoDepth.connect).toHaveBeenCalledWith(tremoloGain.gain);

    // Slow attack floor even when preset attack is snappy (0.02 → BOW_MIN_ATTACK).
    expect(envelopeGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      1,
      10 + BOW_MIN_ATTACK
    );
  });

  it('stop() releases and stops every partial and the LFO', () => {
    const { context, oscillators, envelopeGain } = createMockContext();
    const voice = createBowVoice(context, baseParams);

    for (const osc of oscillators) {
      osc.stop.mockClear();
    }
    envelopeGain.gain.cancelScheduledValues.mockClear();
    envelopeGain.gain.linearRampToValueAtTime.mockClear();

    voice.stop(10.5);

    expect(envelopeGain.gain.cancelScheduledValues).toHaveBeenCalledWith(10.5);
    expect(envelopeGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.0001, 10.75);
    for (const osc of oscillators) {
      expect(osc.stop).toHaveBeenCalledWith(10.75);
    }
  });

  it('onEnded fires once after all sources (partials + LFO) end', () => {
    const onEnded = vi.fn();
    const { context, oscillators, envelopeGain, voiceGain, tremoloGain } = createMockContext({
      onEnded
    });

    createBowVoice(context, baseParams);

    for (let i = 0; i < BOW_PARTIAL_COUNT; i += 1) {
      oscillators[i].onended?.();
    }
    expect(onEnded).not.toHaveBeenCalled();

    oscillators[BOW_PARTIAL_COUNT].onended?.();
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(onEnded).toHaveBeenCalledWith('voice-bow-1');
    expect(envelopeGain.disconnect).toHaveBeenCalled();
    expect(tremoloGain.disconnect).toHaveBeenCalled();
    expect(voiceGain.disconnect).toHaveBeenCalled();
  });

  it('setFrequency retunes all harmonic partials', () => {
    const { context, oscillators } = createMockContext();
    const voice = createBowVoice(context, baseParams);

    voice.setFrequency?.(880, 11);

    for (let i = 0; i < BOW_PARTIAL_COUNT; i += 1) {
      expect(oscillators[i].frequency.setValueAtTime).toHaveBeenCalledWith(880 * (i + 1), 11);
    }
  });
});
