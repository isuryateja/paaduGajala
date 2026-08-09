import { clamp } from '../../../lib/utils/clamp';
import type { AudioVoice } from '../audio.types';
import type { VoiceCreateContext, VoiceCreateParams, VoiceFactory } from './types';

/** Harmonic partials in the flute bank (fundamental + airy overtones). */
export const FLUTE_PARTIAL_COUNT = 3;

/** Relative amplitude for partials 1..3 — soft upper harmonics. */
export const FLUTE_PARTIAL_WEIGHTS: readonly number[] = [1, 0.28, 0.09];

/** Breath-noise level into the mix (very light air). */
export const FLUTE_BREATH_GAIN = 0.035;

/** Minimum attack so flute onsets stay soft even if preset is snappy. */
export const FLUTE_MIN_ATTACK = 0.04;

/** Bandpass Q around the fundamental for breath noise. */
const BREATH_BANDPASS_Q = 1.8;

/** Shared noise buffer length in seconds (looped). */
const NOISE_BUFFER_SECONDS = 0.12;

function createNoiseBuffer(audioContext: AudioContext): AudioBuffer {
  const sampleRate = audioContext.sampleRate || 44100;
  const length = Math.max(1, Math.floor(sampleRate * NOISE_BUFFER_SECONDS));
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Flute additive voice — few partials, soft attack, light bandpassed breath.
 */
export const createFluteVoice: VoiceFactory = (
  context: VoiceCreateContext,
  params: VoiceCreateParams
): AudioVoice => {
  const { audioContext, destination, envelope, onEnded } = context;
  const { id, frequency, startTime, durationSeconds, velocity, svara, octave } = params;

  const envelopeGain = audioContext.createGain();
  const voiceGain = audioContext.createGain();
  voiceGain.gain.value = clamp(velocity, 0, 1);

  const attack = Math.max(envelope.attack, FLUTE_MIN_ATTACK);
  const attackEnd = startTime + attack;
  const decayEnd = attackEnd + envelope.decay;
  envelopeGain.gain.setValueAtTime(0.0001, startTime);
  envelopeGain.gain.linearRampToValueAtTime(1, attackEnd);
  envelopeGain.gain.linearRampToValueAtTime(envelope.sustain, decayEnd);

  const oscillators: OscillatorNode[] = [];
  const partialGains: GainNode[] = [];

  for (let i = 0; i < FLUTE_PARTIAL_COUNT; i += 1) {
    const osc = audioContext.createOscillator();
    const partialGain = audioContext.createGain();
    const weight = FLUTE_PARTIAL_WEIGHTS[i] ?? 0;

    osc.type = 'sine';
    osc.frequency.value = frequency * (i + 1);
    partialGain.gain.value = weight;

    osc.connect(partialGain);
    partialGain.connect(envelopeGain);

    oscillators.push(osc);
    partialGains.push(partialGain);
  }

  // Light breath noise, bandpassed near fundamental.
  const noise = audioContext.createBufferSource();
  noise.buffer = createNoiseBuffer(audioContext);
  noise.loop = true;

  const bandpass = audioContext.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = frequency;
  bandpass.Q.value = BREATH_BANDPASS_Q;

  const noiseGain = audioContext.createGain();
  noiseGain.gain.value = FLUTE_BREATH_GAIN;

  noise.connect(bandpass);
  bandpass.connect(noiseGain);
  noiseGain.connect(envelopeGain);

  envelopeGain.connect(voiceGain);
  voiceGain.connect(destination);

  const sources: AudioScheduledSourceNode[] = [...oscillators, noise];
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
      bandpass.disconnect();
      noiseGain.disconnect();
      envelopeGain.disconnect();
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
    voiceType: 'flute',
    setFrequency: (nextFrequency: number, when?: number) => {
      const t = when ?? audioContext.currentTime;
      for (let i = 0; i < oscillators.length; i += 1) {
        oscillators[i].frequency.setValueAtTime(nextFrequency * (i + 1), t);
      }
      bandpass.frequency.setValueAtTime(nextFrequency, t);
    }
  };

  return voice;
};
