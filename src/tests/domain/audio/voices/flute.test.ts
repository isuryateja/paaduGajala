import { describe, expect, it, vi } from 'vitest';
import {
  createFluteVoice,
  FLUTE_BREATH_GAIN,
  FLUTE_MIN_ATTACK,
  FLUTE_PARTIAL_COUNT,
  FLUTE_PARTIAL_WEIGHTS
} from '../../../../domain/audio/voices/flute';
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
    frequency: {
      value: 0,
      setValueAtTime: vi.fn()
    },
    Q: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn()
  };
}

function createMockContext(overrides: Partial<VoiceCreateContext> = {}): {
  context: VoiceCreateContext;
  oscillators: ReturnType<typeof createOscillatorMock>[];
  noise: ReturnType<typeof createBufferSourceMock>;
  bandpass: ReturnType<typeof createBiquadMock>;
  envelopeGain: ReturnType<typeof createGainMock>;
  voiceGain: ReturnType<typeof createGainMock>;
  noiseGain: ReturnType<typeof createGainMock>;
  destination: { connect: ReturnType<typeof vi.fn> };
} {
  const oscillators: ReturnType<typeof createOscillatorMock>[] = [];
  const noise = createBufferSourceMock();
  const bandpass = createBiquadMock();
  const envelopeGain = createGainMock();
  const voiceGain = createGainMock();
  const noiseGain = createGainMock();
  const destination = { connect: vi.fn() };
  let gainCalls = 0;

  const channelData = new Float32Array(64);
  const buffer = {
    getChannelData: vi.fn(() => channelData)
  };

  const audioContext = {
    currentTime: 10,
    sampleRate: 44100,
    createOscillator: vi.fn(() => {
      const osc = createOscillatorMock();
      oscillators.push(osc);
      return osc;
    }),
    createBufferSource: vi.fn(() => noise),
    createBiquadFilter: vi.fn(() => bandpass),
    createBuffer: vi.fn(() => buffer),
    createGain: vi.fn(() => {
      gainCalls += 1;
      // envelope, voice, N partials, then noiseGain
      if (gainCalls === 1) return envelopeGain;
      if (gainCalls === 2) return voiceGain;
      if (gainCalls <= 2 + FLUTE_PARTIAL_COUNT) return createGainMock();
      return noiseGain;
    })
  };

  const context: VoiceCreateContext = {
    audioContext: audioContext as unknown as AudioContext,
    destination: destination as unknown as AudioNode,
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.2 },
    waveform: 'sine',
    ...overrides
  };

  return { context, oscillators, noise, bandpass, envelopeGain, voiceGain, noiseGain, destination };
}

const baseParams: VoiceCreateParams = {
  id: 'voice-flute-1',
  frequency: 440,
  startTime: 10,
  durationSeconds: 1,
  velocity: 0.7,
  svara: 'S',
  octave: 'madhya'
};

describe('createFluteVoice (P1B-02)', () => {
  it(`builds ${FLUTE_PARTIAL_COUNT} partials plus bandpassed breath noise`, () => {
    const { context, oscillators, noise, bandpass, noiseGain, voiceGain, destination, envelopeGain } =
      createMockContext();

    const voice = createFluteVoice(context, baseParams);

    expect(voice.voiceType).toBe('flute');
    expect(voice.id).toBe('voice-flute-1');
    expect(voice.sources).toHaveLength(FLUTE_PARTIAL_COUNT + 1); // partials + noise
    expect(oscillators).toHaveLength(FLUTE_PARTIAL_COUNT);
    expect(voice.oscillator).toBe(oscillators[0]);
    expect(voiceGain.gain.value).toBe(0.7);
    expect(voiceGain.connect).toHaveBeenCalledWith(destination);

    for (let i = 0; i < FLUTE_PARTIAL_COUNT; i += 1) {
      expect(oscillators[i].type).toBe('sine');
      expect(oscillators[i].frequency.value).toBeCloseTo(440 * (i + 1), 5);
      expect(oscillators[i].start).toHaveBeenCalledWith(10);
      expect(FLUTE_PARTIAL_WEIGHTS[i]).toBeGreaterThan(0);
    }

    expect(noise.loop).toBe(true);
    expect(noise.start).toHaveBeenCalledWith(10);
    expect(noise.connect).toHaveBeenCalledWith(bandpass);
    expect(bandpass.type).toBe('bandpass');
    expect(bandpass.frequency.value).toBe(440);
    expect(bandpass.connect).toHaveBeenCalledWith(noiseGain);
    expect(noiseGain.gain.value).toBe(FLUTE_BREATH_GAIN);
    expect(noiseGain.connect).toHaveBeenCalledWith(envelopeGain);

    // Soft attack floor even when preset attack is snappy (0.02 → FLUTE_MIN_ATTACK).
    expect(envelopeGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      1,
      10 + FLUTE_MIN_ATTACK
    );
  });

  it('stop() releases and stops every partial and the noise source', () => {
    const { context, oscillators, noise, envelopeGain } = createMockContext();
    const voice = createFluteVoice(context, baseParams);

    for (const osc of oscillators) {
      osc.stop.mockClear();
    }
    noise.stop.mockClear();
    envelopeGain.gain.cancelScheduledValues.mockClear();
    envelopeGain.gain.linearRampToValueAtTime.mockClear();

    voice.stop(10.5);

    expect(envelopeGain.gain.cancelScheduledValues).toHaveBeenCalledWith(10.5);
    expect(envelopeGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.0001, 10.7);
    for (const osc of oscillators) {
      expect(osc.stop).toHaveBeenCalledWith(10.7);
    }
    expect(noise.stop).toHaveBeenCalledWith(10.7);
  });

  it('onEnded fires once after all sources (partials + noise) end', () => {
    const onEnded = vi.fn();
    const { context, oscillators, noise, envelopeGain, voiceGain } = createMockContext({ onEnded });

    createFluteVoice(context, baseParams);

    for (const osc of oscillators) {
      osc.onended?.();
    }
    expect(onEnded).not.toHaveBeenCalled();

    noise.onended?.();
    expect(onEnded).toHaveBeenCalledTimes(1);
    expect(onEnded).toHaveBeenCalledWith('voice-flute-1');
    expect(envelopeGain.disconnect).toHaveBeenCalled();
    expect(voiceGain.disconnect).toHaveBeenCalled();
  });
});
