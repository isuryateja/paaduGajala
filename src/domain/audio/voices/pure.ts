import { clamp } from '../../../lib/utils/clamp';
import type { AudioVoice } from '../audio.types';
import type { VoiceCreateContext, VoiceCreateParams, VoiceFactory } from './types';

/**
 * Legacy single-oscillator voice — Phase 1 `pure` path.
 * Behavior matches the pre-extraction AudioEngine.createVoice body.
 */
export const createPureVoice: VoiceFactory = (
  context: VoiceCreateContext,
  params: VoiceCreateParams
): AudioVoice => {
  const { audioContext, destination, envelope, waveform, onEnded } = context;
  const { id, frequency, startTime, durationSeconds, velocity, svara, octave } = params;

  const oscillator = audioContext.createOscillator();
  const envelopeGain = audioContext.createGain();
  const voiceGain = audioContext.createGain();

  oscillator.type = waveform;
  oscillator.frequency.value = frequency;
  voiceGain.gain.value = clamp(velocity, 0, 1);

  const attackEnd = startTime + envelope.attack;
  const decayEnd = attackEnd + envelope.decay;
  envelopeGain.gain.setValueAtTime(0.0001, startTime);
  envelopeGain.gain.linearRampToValueAtTime(1, attackEnd);
  envelopeGain.gain.linearRampToValueAtTime(envelope.sustain, decayEnd);

  oscillator.connect(envelopeGain);
  envelopeGain.connect(voiceGain);
  voiceGain.connect(destination);

  const stop = (when: number = startTime + durationSeconds) => {
    const currentTime = audioContext.currentTime;
    const releaseStart = Math.max(when, currentTime);

    if (releaseStart <= startTime) {
      envelopeGain.gain.cancelScheduledValues(startTime);
      envelopeGain.gain.setValueAtTime(0.0001, startTime);
      oscillator.stop(startTime);
      return;
    }

    envelopeGain.gain.cancelScheduledValues(releaseStart);
    envelopeGain.gain.setValueAtTime(envelopeGain.gain.value || envelope.sustain, releaseStart);
    envelopeGain.gain.linearRampToValueAtTime(0.0001, releaseStart + envelope.release);
    oscillator.stop(releaseStart + envelope.release);
  };

  const voice: AudioVoice = {
    id,
    oscillator,
    sources: [oscillator],
    envelopeGain,
    voiceGain,
    frequency,
    svara,
    octave,
    startTime,
    duration: durationSeconds,
    stop,
    voiceType: 'pure'
  };

  oscillator.onended = () => {
    onEnded?.(id);
    oscillator.disconnect();
    envelopeGain.disconnect();
    voiceGain.disconnect();
  };

  oscillator.start(startTime);
  stop(startTime + durationSeconds);

  return voice;
};
