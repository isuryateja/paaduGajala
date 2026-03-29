import type { OctaveName } from '../shared/types';
import type { SvaraName } from './svara.types';

export const OCTAVE_SUFFIX: Record<OctaveName, string> = {
  mandra: '.',
  mandara: '.',
  madhya: '',
  taara: "'"
};

export const SVARA_NAMES: SvaraName[] = [
  'S',
  'R1',
  'R2',
  'R3',
  'G1',
  'G2',
  'G3',
  'M1',
  'M2',
  'P',
  'D1',
  'D2',
  'D3',
  'N1',
  'N2',
  'N3'
];
