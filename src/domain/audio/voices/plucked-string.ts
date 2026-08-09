import { clamp } from '../../../lib/utils/clamp';
import type { AudioVoice } from '../audio.types';
import type { VoiceCreateContext, VoiceCreateParams, VoiceFactory } from './types';

/** Number of harmonic partials in the plucked bank (veena-like). */
export const PLUCKED_PARTIAL_COUNT = 6;

/**
 * Stiffness coefficient for slight inharmonicity:
 * freq_n = f × n × (1 + σ × n²)
 * Small σ keeps the pitch musical while avoiding a pure harmonic comb.
 */
export const PLUCKED_INHARMONICITY = 0.00035;

/**
 * Relative amplitude weights for partials 1..N (fundamental first).
 * Higher partials are quieter (string body roll-off).
 */
export const PLUCKED_PARTIAL_WEIGHTS: readonly number[] = [1, 0.55, 0.32, 0.18, 0.1, 0.05];

/**
 * Extra decay seconds added per partial index so high harmonics die first.
 * Partial k decays roughly `duration * (1 - k * factor)` of the note body.
 */
const HIGH_PARTIAL_DECAY_FACTOR = 0.12;

function partialFrequency(fundamental: number, partialIndex: number): number {
  const n = partialIndex + 1;
  return fundamental * n * (1 + PLUCKED_INHARMONICITY * n * n);
}

function partialWeight(partialIndex: number): number {
  return PLUCKED_PARTIAL_WEIGHTS[partialIndex] ?? 1 / (partialIndex + 1);
}

/**
 * Plucked-string additive voice (veena character).
 * ~6 sine partials with mild inharmonicity and faster high-partial decay.
 */
export const createPluckedStringVoice: VoiceFactory = (
  context: VoiceCreateContext,
  params: VoiceCreateParams
): AudioVoice => {
  const { audioContext, destination, envelope, onEnded } = context;
  const { id, frequency, startTime, durationSeconds, velocity, svara, octave } = params;

  const envelopeGain = audioContext.createGain();
  const voiceGain = audioContext.createGain();
  voiceGain.gain.value = clamp(velocity, 0, 1);

  // Master ADSR (fast pluck-friendly when presets supply short attack).
  const attackEnd = startTime + envelope.attack;
  const decayEnd = attackEnd + envelope.decay;
  envelopeGain.gain.setValueAtTime(0.0001, startTime);
  envelopeGain.gain.linearRampToValueAtTime(1, attackEnd);
  envelopeGain.gain.linearRampToValueAtTime(envelope.sustain, decayEnd);

  const oscillators: OscillatorNode[] = [];
  const partialGains: GainNode[] = [];

  for (let i = 0; i < PLUCKED_PARTIAL_COUNT; i += 1) {
    const osc = audioContext.createOscillator();
    const partialGain = audioContext.createGain();
    const weight = partialWeight(i);

    osc.type = 'sine';
    osc.frequency.value = partialFrequency(frequency, i);

    // Faster high-partial decay: ring time shrinks with partial index.
    const ringFraction = Math.max(0.15, 1 - i * HIGH_PARTIAL_DECAY_FACTOR);
    const ringEnd = startTime + durationSeconds * ringFraction;

    partialGain.gain.setValueAtTime(weight, startTime);
    partialGain.gain.exponentialRampToValueAtTime(0.0001, Math.max(ringEnd, startTime + 0.02));

    osc.connect(partialGain);
    partialGain.connect(envelopeGain);

    oscillators.push(osc);
    partialGains.push(partialGain);
  }

  envelopeGain.connect(voiceGain);
  voiceGain.connect(destination);

  const fundamental = oscillators[0];

  const stop = (when: number = startTime + durationSeconds) => {
    const currentTime = audioContext.currentTime;
    const releaseStart = Math.max(when, currentTime);
    const releaseEnd = releaseStart + envelope.release;

    if (releaseStart <= startTime) {
      envelopeGain.gain.cancelScheduledValues(startTime);
      envelopeGain.gain.setValueAtTime(0.0001, startTime);
      for (const osc of oscillators) {
        try {
          osc.stop(startTime);
        } catch {
          // already stopped
        }
      }
      return;
    }

    envelopeGain.gain.cancelScheduledValues(releaseStart);
    envelopeGain.gain.setValueAtTime(envelopeGain.gain.value || envelope.sustain, releaseStart);
    envelopeGain.gain.linearRampToValueAtTime(0.0001, releaseEnd);

    for (const osc of oscillators) {
      try {
        osc.stop(releaseEnd);
      } catch {
        // already stopped
      }
    }
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

  // Auto-release at note end (same contract as pure).
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
    voiceType: 'plucked',
    setFrequency: (nextFrequency: number, when?: number) => {
      const t = when ?? audioContext.currentTime;
      for (let i = 0; i < oscillators.length; i += 1) {
        oscillators[i].frequency.setValueAtTime(partialFrequency(nextFrequency, i), t);
      }
    }
  };

  return voice;
};
