import type { OctaveName } from '../shared/types';
import type { SvaraName } from './svara.types';

const OCTAVE_ALIASES: Record<string, OctaveName> = {
  '1': 'mandra',
  '2': 'madhya',
  '3': 'taara',
  low: 'mandra',
  mandra: 'mandra',
  mandara: 'mandra',
  middle: 'madhya',
  madhya: 'madhya',
  high: 'taara',
  taara: 'taara'
};

const SVARA_ALIASES: Record<string, SvaraName> = {
  s: 'S',
  r: 'R2',
  r1: 'R1',
  r2: 'R2',
  r3: 'R3',
  g: 'G3',
  g1: 'G1',
  g2: 'G2',
  g3: 'G3',
  m: 'M1',
  m1: 'M2',
  m2: 'M2',
  p: 'P',
  d: 'D2',
  d1: 'D1',
  d2: 'D2',
  d3: 'D3',
  n: 'N3',
  n1: 'N1',
  n2: 'N2',
  n3: 'N3'
};

export function normalizeOctaveName(octave: string | OctaveName): OctaveName {
  return OCTAVE_ALIASES[octave] ?? 'madhya';
}

export function normalizeSvaraName(svara: string): SvaraName {
  const normalized = svara.trim().toUpperCase().replace(/\s+/g, '');
  const aliasKey = svara.trim().toLowerCase();
  return (SVARA_ALIASES[aliasKey] ?? normalized) as SvaraName;
}
