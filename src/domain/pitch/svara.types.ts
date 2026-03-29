import type { OctaveName } from '../shared/types';

export type SvaraName =
  | 'S'
  | 'R1'
  | 'R2'
  | 'R3'
  | 'G1'
  | 'G2'
  | 'G3'
  | 'M1'
  | 'M2'
  | 'P'
  | 'D1'
  | 'D2'
  | 'D3'
  | 'N1'
  | 'N2'
  | 'N3';

export interface SvaraFrequencyInfo {
  frequency: number;
  western: string;
  semitones: number;
  name: string;
  octave: OctaveName;
  equivalent?: string;
}
