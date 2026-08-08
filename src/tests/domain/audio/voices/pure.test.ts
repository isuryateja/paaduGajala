import { describe, expect, it, vi } from 'vitest';
import { createPureVoice } from '../../../../domain/audio/voices/pure';
import type { VoiceCreateContext, VoiceCreateParams } from '../../../../domain/audio/voices/types';

function createGainMock() {
  return {
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      cancelScheduledValues: vi.fn()
    },
    connect: vi.fn(),
    disconnect: vi.fn()
  };
}

function createOscillatorMock() {
  return {
    type: 'sine' as OscillatorType,
    frequency: { value: 0 },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as (() => void) | null
  };
}

function createMockContext(overrides: Partial<VoiceCreateContext> = {}): {
  context: VoiceCreateContext;
  oscillator: ReturnType<typeof createOscillatorMock>;
  envelopeGain: ReturnType<typeof createGainMock>;
  voiceGain: ReturnType<typeof createGainMock>;
  destination: { connect: ReturnType<typeof vi.fn> };
} {
  const oscillator = createOscillatorMock();
  const envelopeGain = createGainMock();
  const voiceGain = createGainMock();
  const destination = { connect: vi.fn() };

  const audioContext = {
    currentTime: 10,
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => {
      // envelope first, then voiceGain — factories call createGain in that order
      if ((audioContext.createGain as ReturnType<typeof vi.fn>).mock.calls.length === 1) {
        return envelopeGain;
      }
      return voiceGain;
    })
  };

  // recreate createGain with stable call counting after audioContext exists
  let gainCalls = 0;
  audioContext.createGain = vi.fn(() => {
    gainCalls += 1;
    return gainCalls === 1 ? envelopeGain : voiceGain;
  });

  const context: VoiceCreateContext = {
    audioContext: audioContext as unknown as AudioContext,
    destination: destination as unknown as AudioNode,
    envelope: { attack: 0.02, decay: 0.05, sustain: 0.7, release: 0.15 },
    waveform: 'triangle',
    ...overrides
  };

  return { context, oscillator, envelopeGain, voiceGain, destination };
}

const baseParams: VoiceCreateParams = {
  id: 'voice-pure-1',
  frequency: 261.63,
  startTime: 10,
  durationSeconds: 1,
  velocity: 0.8,
  svara: 'S',
  octave: 'madhya'
};

describe('createPureVoice (P1A-02)', () => {
  it('builds a single-oscillator pure voice with ADSR and correct wiring', () => {
    const { context, oscillator, envelopeGain, voiceGain, destination } = createMockContext();

    const voice = createPureVoice(context, baseParams);

    expect(voice.voiceType).toBe('pure');
    expect(voice.id).toBe('voice-pure-1');
    expect(voice.frequency).toBe(261.63);
    expect(voice.svara).toBe('S');
    expect(voice.octave).toBe('madhya');
    expect(voice.duration).toBe(1);
    expect(voice.oscillator).toBe(oscillator);
    expect(voice.sources).toEqual([oscillator]);

    expect(oscillator.type).toBe('triangle');
    expect(oscillator.frequency.value).toBe(261.63);
    expect(voiceGain.gain.value).toBe(0.8);

    expect(envelopeGain.gain.setValueAtTime).toHaveBeenCalledWith(0.0001, 10);
    expect(envelopeGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(1, 10.02);
    expect(envelopeGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.7, 10.07);

    expect(oscillator.connect).toHaveBeenCalledWith(envelopeGain);
    expect(envelopeGain.connect).toHaveBeenCalledWith(voiceGain);
    expect(voiceGain.connect).toHaveBeenCalledWith(destination);

    expect(oscillator.start).toHaveBeenCalledWith(10);
    // auto-scheduled release stop at start + duration + release
    expect(oscillator.stop).toHaveBeenCalledWith(11.15);
  });

  it('clamps velocity into 0..1', () => {
    const { context, voiceGain } = createMockContext();
    createPureVoice(context, { ...baseParams, velocity: 2 });
    expect(voiceGain.gain.value).toBe(1);
  });

  it('stop() schedules release from the later of when and currentTime', () => {
    const { context, oscillator, envelopeGain } = createMockContext();
    const voice = createPureVoice(context, baseParams);

    // clear auto-stop call from construction
    oscillator.stop.mockClear();
    envelopeGain.gain.cancelScheduledValues.mockClear();
    envelopeGain.gain.setValueAtTime.mockClear();
    envelopeGain.gain.linearRampToValueAtTime.mockClear();

    // audioContext.currentTime is 10; request stop at 10.5
    voice.stop(10.5);

    expect(envelopeGain.gain.cancelScheduledValues).toHaveBeenCalledWith(10.5);
    expect(envelopeGain.gain.setValueAtTime).toHaveBeenCalled();
    expect(envelopeGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.0001, 10.65);
    expect(oscillator.stop).toHaveBeenCalledWith(10.65);
  });

  it('invokes onEnded and disconnects nodes when oscillator ends', () => {
    const onEnded = vi.fn();
    const { context, oscillator, envelopeGain, voiceGain } = createMockContext({ onEnded });

    createPureVoice(context, baseParams);

    expect(typeof oscillator.onended).toBe('function');
    oscillator.onended?.();

    expect(onEnded).toHaveBeenCalledWith('voice-pure-1');
    expect(oscillator.disconnect).toHaveBeenCalled();
    expect(envelopeGain.disconnect).toHaveBeenCalled();
    expect(voiceGain.disconnect).toHaveBeenCalled();
  });
});
