import type { OctaveName, TuningMode, WaveformType } from '../shared/types';

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
}

export interface AudioVoice {
  id: string;
  oscillator: OscillatorNode;
  envelopeGain: GainNode;
  voiceGain: GainNode;
  frequency: number;
  svara: string;
  octave: OctaveName;
  startTime: number;
  duration: number;
  stop: (when?: number) => void;
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
