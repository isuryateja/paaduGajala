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
  svara: string;
  octave?: OctaveName;
  duration?: number;
  velocity?: number;
  rest?: boolean;
  originalIndex?: number;
}

export interface SequenceState {
  notes: SequenceNote[];
  tempo: number;
  loop: boolean;
  loopCount: number;
  currentIndex: number;
  isPlaying: boolean;
  cancel: () => void;
}
