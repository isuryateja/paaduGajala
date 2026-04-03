import { getSvaraFrequency } from './svara-frequencies';
import { SVARA_NAMES } from './svara.constants';

export type NadaMappedOctave = 'mandra' | 'madhya' | 'taara';

export interface FrequencySvaraMatch {
  svara: string;
  octave: NadaMappedOctave;
  referenceFrequencyHz: number;
  deltaHz: number;
}

const MAPPED_OCTAVES: NadaMappedOctave[] = ['mandra', 'madhya', 'taara'];

export function mapFrequencyToClosestSvara(frequencyHz: number): FrequencySvaraMatch {
  let bestMatch: FrequencySvaraMatch = {
    svara: 'S',
    octave: 'madhya',
    referenceFrequencyHz: getSvaraFrequency('S', 'madhya'),
    deltaHz: Number.POSITIVE_INFINITY
  };

  for (const octave of MAPPED_OCTAVES) {
    for (const svara of SVARA_NAMES) {
      const referenceFrequencyHz = getSvaraFrequency(svara, octave);
      const deltaHz = Math.abs(referenceFrequencyHz - frequencyHz);

      if (deltaHz < bestMatch.deltaHz) {
        bestMatch = {
          svara,
          octave,
          referenceFrequencyHz,
          deltaHz
        };
      }
    }
  }

  return bestMatch;
}
