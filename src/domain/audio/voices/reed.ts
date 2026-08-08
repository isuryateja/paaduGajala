import { clamp } from '../../../lib/utils/clamp';
import type { AudioVoice } from '../audio.types';
import type { VoiceCreateContext, VoiceCreateParams, VoiceFactory } from './types';

/** Harmonic partials in the reed bank (harmonium / free-reed character). */
export const REED_PARTIAL_COUNT = 7;

/**
 * Relative amplitudes for partials 1..7 — strong odd harmonics (square-ish).
 * Even partials are kept very low for a reedy buzz without full square harshness.
 */
export const REED_PARTIAL_WEIGHTS: readonly number[] = [
  1, // 1 fundamental
  0.12, // 2
  0.58, // 3
  0.07, // 4
  0.36, // 5
  0.04, // 6
  0.22 // 7
];

/** Medium attack floor — firmer than flute, quicker than bow. */
export const REED_MIN_ATTACK = 0.03;

/**
 * Reed additive voice (harmonium character).
 * Strong odd-harmonic stack with a medium attack floor.
 */
export const createReedVoice: VoiceFactory = (
  context: VoiceCreateContext,
  params: VoiceCreateParams
): AudioVoice => {
  const { audioContext, destination, envelope, onEnded } = context;
  const { id, frequency, startTime, durationSeconds, velocity, svara, octave } = params;

  const envelopeGain = audioContext.createGain();
  const voiceGain = audioContext.createGain();
  voiceGain.gain.value = clamp(velocity, 0, 1);

  const attack = Math.max(envelope.attack, REED_MIN_ATTACK);
  const attackEnd = startTime + attack;
  const decayEnd = attackEnd + envelope.decay;
  envelopeGain.gain.setValueAtTime(0.0001, startTime);
  envelopeGain.gain.linearRampToValueAtTime(1, attackEnd);
  envelopeGain.gain.linearRampToValueAtTime(envelope.sustain, decayEnd);

  const oscillators: OscillatorNode[] = [];
  const partialGains: GainNode[] = [];

  for (let i = 0; i < REED_PARTIAL_COUNT; i += 1) {
    const osc = audioContext.createOscillator();
    const partialGain = audioContext.createGain();
    const weight = REED_PARTIAL_WEIGHTS[i] ?? 0;

    osc.type = 'sine';
    osc.frequency.value = frequency * (i + 1);
    partialGain.gain.value = weight;

    osc.connect(partialGain);
    partialGain.connect(envelopeGain);

    oscillators.push(osc);
    partialGains.push(partialGain);
  }

  envelopeGain.connect(voiceGain);
  voiceGain.connect(destination);

  const fundamental = oscillators[0];

  const stopSources = (when: number) => {
    for (const osc of oscillators) {
      try {
        osc.stop(when);
      } catch {
        // already stopped
      }
    }
  };

  const stop = (when: number = startTime + durationSeconds) => {
    const currentTime = audioContext.currentTime;
    const releaseStart = Math.max(when, currentTime);
    const releaseEnd = releaseStart + envelope.release;

    if (releaseStart <= startTime) {
      envelopeGain.gain.cancelScheduledValues(startTime);
      envelopeGain.gain.setValueAtTime(0.0001, startTime);
      stopSources(startTime);
      return;
    }

    envelopeGain.gain.cancelScheduledValues(releaseStart);
    envelopeGain.gain.setValueAtTime(envelopeGain.gain.value || envelope.sustain, releaseStart);
    envelopeGain.gain.linearRampToValueAtTime(0.0001, releaseEnd);
    stopSources(releaseEnd);
  };

  let endedCount = 0;
  const handleEnded = () => {
    endedCount += 1;
    if (endedCount < oscillators.length) {
      return;
    }
    onEnded?.(id);
    for (const osc of oscillators) {
      try {
        osc.disconnect();
      } catch {
        // ignore
      }
    }
    for (const g of partialGains) {
      try {
        g.disconnect();
      } catch {
        // ignore
      }
    }
    try {
      envelopeGain.disconnect();
      voiceGain.disconnect();
    } catch {
      // ignore
    }
  };

  for (const osc of oscillators) {
    osc.onended = handleEnded;
    osc.start(startTime);
  }

  stop(startTime + durationSeconds);

  const voice: AudioVoice = {
    id,
    oscillator: fundamental,
    sources: oscillators,
    envelopeGain,
    voiceGain,
    frequency,
    svara,
    octave,
    startTime,
    duration: durationSeconds,
    stop,
    voiceType: 'reed',
    setFrequency: (nextFrequency: number, when?: number) => {
      const t = when ?? audioContext.currentTime;
      for (let i = 0; i < oscillators.length; i += 1) {
        oscillators[i].frequency.setValueAtTime(nextFrequency * (i + 1), t);
      }
    }
  };

  return voice;
};
