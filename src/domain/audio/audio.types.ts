import type { OctaveName, TuningMode, WaveformType } from '../shared/types';

/**
 * Additive-voice taxonomy for Phase 1 migration.
 * `pure` is the legacy single-oscillator path; others are instrument banks (Phase B).
 */
export type VoiceType = 'pure' | 'plucked' | 'flute' | 'bow' | 'reed';

/** Convolution IR length/character presets for Phase 2 reverb. */
export type ReverbPreset = 'room' | 'hall' | 'concert';

export const REVERB_PRESETS: readonly ReverbPreset[] = ['room', 'hall', 'concert'] as const;

export interface AudioEnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface AudioEngineConfig {
  waveform: WaveformType;
  envelope: AudioEnvelope;
  masterVolume: number;
  tuning: TuningMode;
  baseFrequency: number;
  /**
   * Additive voice bank for note creation.
   * Default `pure` (single oscillator). Instrument banks from Phase 1.
   */
  voiceType: VoiceType;
  /**
   * Wet reverb send amount (0 = dry / Phase A sound-identical, 1 = full wet).
   * Drives wet/dry gains on the shared reverb graph (P2A-03).
   */
  reverbMix: number;
  /** Which procedural IR the shared convolver loads. */
  reverbPreset: ReverbPreset;
}

/**
 * Active note instance owned by AudioEngine.
 *
 * Phase 1 generalizes the pure single-oscillator shape:
 * - `oscillator` remains for the legacy pure path (optional once multi-partial banks land).
 * - `sources` lists every scheduled source the voice must stop/disconnect.
 * - `setFrequency` is reserved for future continuous pitch automation (gamaka).
 */
export interface AudioVoice {
  id: string;
  /** Primary oscillator on the pure single-osc path; may be omitted for multi-partial banks. */
  oscillator?: OscillatorNode;
  /** All scheduled sources owned by this voice (oscillators, buffer sources, etc.). */
  sources?: AudioScheduledSourceNode[];
  envelopeGain: GainNode;
  voiceGain: GainNode;
  frequency: number;
  svara: string;
  octave: OctaveName;
  startTime: number;
  duration: number;
  stop: (when?: number) => void;
  /** Optional retune hook for multi-partial / motion automation (not required in Phase A). */
  setFrequency?: (frequency: number, when?: number) => void;
  voiceType?: VoiceType;
}

export interface SequenceNote {
  type?: 'svara';
  svara: string;
  octave?: OctaveName;
  duration?: number;
  velocity?: number;
  rest?: boolean;
  originalIndex?: number;
}

export interface SequenceBoundary {
  type: 'boundary';
  boundaryKind: 'beat' | 'phrase';
  marker: '|' | '||';
  originalIndex?: number;
}

export interface SequenceSilence {
  type: 'silence';
  duration: number;
  originalIndex?: number;
}

export type SequenceItem = SequenceNote | SequenceBoundary | SequenceSilence;

export interface SequenceState {
  notes: SequenceItem[];
  tempo: number;
  loop: boolean;
  loopCount: number;
  currentIndex: number;
  isPlaying: boolean;
  cancel: () => void;
}
