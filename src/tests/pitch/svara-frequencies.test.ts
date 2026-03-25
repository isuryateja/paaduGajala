import { describe, expect, it } from 'vitest';
import { getSvaraFrequency, getSvaraInfo } from '../../domain/pitch/svara-frequencies';

describe('svara frequencies', () => {
  it('returns madhya sa frequency', () => {
    expect(getSvaraFrequency('S', 'madhya')).toBeCloseTo(261.63, 1);
  });

  it('returns svara metadata', () => {
    expect(getSvaraInfo('R1', 'madhya').western).toContain('C#4');
  });
});
