import type { OctaveName, WaveformType } from '../../shared/types';
import type { AudioEnvelope, AudioVoice, VoiceType } from '../audio.types';

export type { VoiceType } from '../audio.types';

export const VOICE_TYPES: readonly VoiceType[] = [
  'pure',
  'plucked',
  'flute',
  'bow',
  'reed'
] as const;

/** Shared engine context passed into every voice factory. */
export interface VoiceCreateContext {
  audioContext: AudioContext;
  /** Downstream bus (today: DynamicsCompressorNode). */
  destination: AudioNode;
  envelope: AudioEnvelope;
  /** Used by `pure` (and as a fallback character hint for other types). */
  waveform: WaveformType;
  /**
   * Optional owner callback when the voice's primary source ends.
   * AudioEngine uses this to drop the voice from `activeVoices`.
   */
  onEnded?: (voiceId: string) => void;
}

/** Per-note parameters for a single voice instance. */
export interface VoiceCreateParams {
  id: string;
  frequency: number;
  startTime: number;
  durationSeconds: number;
  velocity: number;
  svara: string;
  octave: OctaveName;
}

/**
 * Factory signature for all voice implementations.
 * Factories must schedule start, release, and disconnect cleanup themselves.
 */
export type VoiceFactory = (context: VoiceCreateContext, params: VoiceCreateParams) => AudioVoice;
