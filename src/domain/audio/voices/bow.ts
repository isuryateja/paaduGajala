import { clamp } from '../../../lib/utils/clamp';
import type { AudioVoice } from '../audio.types';
import type { VoiceCreateContext, VoiceCreateParams, VoiceFactory } from './types';

/** Harmonic partials in the bow bank (richer than flute). */
export const BOW_PARTIAL_COUNT = 8;

/**
 * Relative amplitudes for partials 1..8 — odd harmonics emphasized (violin-ish).
 * Even partials stay present but quieter so the stack is not pure sawtooth.
 */
export const BOW_PARTIAL_WEIGHTS: readonly number[] = [
  1, // 1 fundamental
  0.38, // 2
  0.72, // 3
  0.22, // 4
  0.48, // 5
  0.14, // 6
  0.3, // 7
  0.08 // 8
];

/** Minimum attack so bow onsets stay slow even if preset is snappy. */
export const BOW_MIN_ATTACK = 0.08;

/** Tremolo LFO rate in Hz (mild bow-pressure shimmer). */
export const BOW_LFO_RATE = 5.5;

/** Peak gain modulation depth around unity (mild). */
export const BOW_LFO_DEPTH = 0.035;

/**
 * Bowed-string additive voice (violin character).
 * Odd-emphasized partial stack, soft/slow attack floor, mild gain LFO tremolo.
 */
export const createBowVoice: VoiceFactory = (
  context: VoiceCreateContext,
  params: VoiceCreateParams
): AudioVoice => {
  const { audioContext, destination, envelope, onEnded } = context;
  const { id, frequency, startTime, durationSeconds, velocity, svara, octave } = params;

  const envelopeGain = audioContext.createGain();
  const tremoloGain = audioContext.createGain();
  const voiceGain = audioContext.createGain();
  voiceGain.gain.value = clamp(velocity, 0, 1);
  tremoloGain.gain.value = 1;

  const attack = Math.max(envelope.attack, BOW_MIN_ATTACK);
  const attackEnd = startTime + attack;
  const decayEnd = attackEnd + envelope.decay;
  envelopeGain.gain.setValueAtTime(0.0001, startTime);
  envelopeGain.gain.linearRampToValueAtTime(1, attackEnd);
  envelopeGain.gain.linearRampToValueAtTime(envelope.sustain, decayEnd);

  const oscillators: OscillatorNode[] = [];
  const partialGains: GainNode[] = [];

  for (let i = 0; i < BOW_PARTIAL_COUNT; i += 1) {
    const osc = audioContext.createOscillator();
    const partialGain = audioContext.createGain();
    const weight = BOW_PARTIAL_WEIGHTS[i] ?? 0;

    osc.type = 'sine';
    osc.frequency.value = frequency * (i + 1);
    partialGain.gain.value = weight;

    osc.connect(partialGain);
    partialGain.connect(envelopeGain);

    oscillators.push(osc);
    partialGains.push(partialGain);
  }

  // Mild gain LFO: LFO → depth → tremoloGain.gain (AudioParam).
  const lfo = audioContext.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = BOW_LFO_RATE;

  const lfoDepth = audioContext.createGain();
  lfoDepth.gain.value = BOW_LFO_DEPTH;

  lfo.connect(lfoDepth);
  lfoDepth.connect(tremoloGain.gain);

  envelopeGain.connect(tremoloGain);
  tremoloGain.connect(voiceGain);
  voiceGain.connect(destination);

  const sources: AudioScheduledSourceNode[] = [...oscillators, lfo];
  const fundamental = oscillators[0];

  const stopSources = (when: number) => {
    for (const source of sources) {
      try {
        source.stop(when);
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
    if (endedCount < sources.length) {
      return;
    }
    onEnded?.(id);
    for (const source of sources) {
      try {
        source.disconnect();
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
      lfoDepth.disconnect();
      envelopeGain.disconnect();
      tremoloGain.disconnect();
      voiceGain.disconnect();
    } catch {
      // ignore
    }
  };

  for (const source of sources) {
    source.onended = handleEnded;
    source.start(startTime);
  }

  stop(startTime + durationSeconds);

  const voice: AudioVoice = {
    id,
    oscillator: fundamental,
    sources,
    envelopeGain,
    voiceGain,
    frequency,
    svara,
    octave,
    startTime,
    duration: durationSeconds,
    stop,
    voiceType: 'bow',
    setFrequency: (nextFrequency: number, when?: number) => {
      const t = when ?? audioContext.currentTime;
      for (let i = 0; i < oscillators.length; i += 1) {
        oscillators[i].frequency.setValueAtTime(nextFrequency * (i + 1), t);
      }
    }
  };

  return voice;
};
