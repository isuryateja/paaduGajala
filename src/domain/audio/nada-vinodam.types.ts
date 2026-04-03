import type { WaveformType } from '../shared/types';
import type { NadaMappedOctave } from '../pitch/frequency-to-svara';

export interface NadaVinodamState {
  frequencyHz: number;
  gain: number;
  attackSeconds: number;
  releaseSeconds: number;
  waveform: WaveformType;
  sustainEnabled: boolean;
  isPlaying: boolean;
  mappedSvara: string;
  mappedOctave: NadaMappedOctave;
  signalPeak: number;
  audioReady: boolean;
  audioError: string | null;
}

export interface NadaVinodamSynthConfig {
  frequencyHz: number;
  gain: number;
  attackSeconds: number;
  releaseSeconds: number;
  waveform: WaveformType;
  sustainEnabled: boolean;
  oneShotDurationMs: number;
}

export interface NadaAnalyserFrame {
  timeDomain: Float32Array;
  peak: number;
  timestampMs: number;
}

export interface NadaVinodamSynth {
  init: () => Promise<void>;
  start: () => Promise<void>;
  stop: () => void;
  setFrequency: (frequencyHz: number) => void;
  setGain: (gain: number) => void;
  setEnvelope: (envelope: Pick<NadaVinodamSynthConfig, 'attackSeconds' | 'releaseSeconds'>) => void;
  setWaveform: (waveform: WaveformType) => void;
  setSustainEnabled: (enabled: boolean) => void;
  readAnalyserFrame: () => NadaAnalyserFrame | null;
  destroy: () => void;
}
