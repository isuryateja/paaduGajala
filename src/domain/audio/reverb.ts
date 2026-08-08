import type { ReverbPreset } from './audio.types';

/**
 * Target IR lengths (seconds) per preset — matches Phase 2 plan:
 * short room ≈ 0.8 s, hall ≈ 2.5 s, concert ≈ 4 s.
 */
export const REVERB_IR_DURATIONS: Readonly<Record<ReverbPreset, number>> = {
  room: 0.8,
  hall: 2.5,
  concert: 4
};

/** Stereo IR for a basic L/R spatial feel. */
export const REVERB_IR_CHANNELS = 2;

/**
 * Decay curve exponent: higher = steeper (room dies faster).
 * Not a physical model — just procedural character.
 */
const DECAY_POWER: Readonly<Record<ReverbPreset, number>> = {
  room: 3.5,
  hall: 2.2,
  concert: 1.6
};

export function getReverbDurationSeconds(preset: ReverbPreset): number {
  return REVERB_IR_DURATIONS[preset];
}

/**
 * Fill one channel with noise shaped by an exponential-style decay envelope.
 * Pure helper — testable without Web Audio.
 *
 * @param channelOffset slight phase offset for stereo decorrelation (0 or 1)
 */
export function fillNoiseDecayChannel(
  data: Float32Array,
  preset: ReverbPreset,
  channelOffset: number = 0
): void {
  const length = data.length;
  if (length === 0) {
    return;
  }
  const power = DECAY_POWER[preset];
  for (let i = 0; i < length; i += 1) {
    const t = i / length;
    // Decorrelate channels with a tiny sample lag so L/R are not identical.
    const lag = channelOffset * 0.0007;
    const tLag = Math.min(1, Math.max(0, t + lag));
    const envelope = Math.pow(1 - tLag, power);
    const noise = Math.random() * 2 - 1;
    data[i] = noise * envelope;
  }
}

export type ReverbAudioContext = Pick<BaseAudioContext, 'sampleRate' | 'createBuffer'>;

/**
 * Build a procedural noise-decay impulse response for a convolver.
 * No asset download — generated at init / preset change.
 */
export function createReverbImpulse(
  audioContext: ReverbAudioContext,
  preset: ReverbPreset
): AudioBuffer {
  const sampleRate = audioContext.sampleRate || 44100;
  const duration = getReverbDurationSeconds(preset);
  const length = Math.max(1, Math.floor(sampleRate * duration));
  const buffer = audioContext.createBuffer(REVERB_IR_CHANNELS, length, sampleRate);

  for (let ch = 0; ch < REVERB_IR_CHANNELS; ch += 1) {
    fillNoiseDecayChannel(buffer.getChannelData(ch), preset, ch);
  }

  return buffer;
}
