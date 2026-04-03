import { describe, expect, it } from 'vitest';
import { mapFrequencyToClosestSvara } from '../../domain/pitch/frequency-to-svara';

describe('frequency to svara mapping', () => {
  it('maps middle sa exactly at concert C', () => {
    expect(mapFrequencyToClosestSvara(261.63)).toMatchObject({
      svara: 'S',
      octave: 'madhya'
    });
  });

  it('maps lower sa into the mandra register', () => {
    expect(mapFrequencyToClosestSvara(130.81)).toMatchObject({
      svara: 'S',
      octave: 'mandra'
    });
  });

  it('maps upper sa into the taara register', () => {
    expect(mapFrequencyToClosestSvara(523.25)).toMatchObject({
      svara: 'S',
      octave: 'taara'
    });
  });
});
