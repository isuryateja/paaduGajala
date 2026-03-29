import * as legacyPitchModule from '../../../svara_frequencies.js';
import type { OctaveName } from '../shared/types';
import { OCTAVE_SUFFIX } from './svara.constants';
import { normalizeOctaveName, normalizeSvaraName } from './svara-normalization';
import type { SvaraFrequencyInfo, SvaraName } from './svara.types';

type LegacyPitchModule = {
  REFERENCE_A4: number;
  BASE_SA_FREQUENCY: number;
  SEMITONE_RATIO: number;
  JUST_INTONATION_RATIOS: Record<string, { ratio: number }>;
  SVARA_FREQUENCIES: Record<string, SvaraFrequencyInfo>;
  getSvaraFrequency: (svara: string, octave?: string) => number;
  getAllOctaves?: (svara: string) => Record<string, number>;
  getJustIntonationFrequency?: (svara: string, baseFreq?: number) => number;
};

const legacyPitch = legacyPitchModule as unknown as LegacyPitchModule;

export const REFERENCE_A4 = legacyPitch.REFERENCE_A4;
export const BASE_SA_FREQUENCY = legacyPitch.BASE_SA_FREQUENCY;
export const SEMITONE_RATIO = legacyPitch.SEMITONE_RATIO;
export const JUST_INTONATION_RATIOS = legacyPitch.JUST_INTONATION_RATIOS;
export const SVARA_FREQUENCIES = legacyPitch.SVARA_FREQUENCIES;

export function getSvaraFrequency(svara: string, octave: string = 'madhya'): number {
  return legacyPitch.getSvaraFrequency(normalizeSvaraName(svara), normalizeOctaveName(octave));
}

export function getSvaraKey(svara: string, octave: string = 'madhya'): string {
  const normalizedSvara = normalizeSvaraName(svara);
  const normalizedOctave = normalizeOctaveName(octave);
  return `${normalizedSvara}${OCTAVE_SUFFIX[normalizedOctave]}`;
}

export function getSvaraInfo(svara: string, octave: string = 'madhya'): SvaraFrequencyInfo {
  const key = getSvaraKey(svara, octave);
  const match = SVARA_FREQUENCIES[key];
  if (!match) {
    throw new Error(`Unknown svara key: ${key}`);
  }
  return match;
}

export function getAllOctaves(svara: SvaraName): Record<OctaveName, number> {
  return {
    mandra: getSvaraFrequency(svara, 'mandra'),
    mandara: getSvaraFrequency(svara, 'mandra'),
    madhya: getSvaraFrequency(svara, 'madhya'),
    taara: getSvaraFrequency(svara, 'taara')
  };
}
