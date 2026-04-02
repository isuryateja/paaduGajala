import { describe, expect, it } from 'vitest';
import { getSvaraFrequency, getSvaraInfo } from '../../domain/pitch/svara-frequencies';

describe('svara frequencies', () => {
  it('returns madhya sa frequency', () => {
    expect(getSvaraFrequency('S', 'madhya')).toBeCloseTo(261.63, 1);
  });

  it('keeps M1 and M2 as distinct madhya frequencies', () => {
    expect(getSvaraFrequency('M1', 'madhya')).toBeCloseTo(349.23, 1);
    expect(getSvaraFrequency('M2', 'madhya')).toBeCloseTo(369.99, 1);
    expect(getSvaraFrequency('M1', 'madhya')).not.toBe(getSvaraFrequency('M2', 'madhya'));
  });

  it('returns svara metadata', () => {
    expect(getSvaraInfo('R1', 'madhya').western).toContain('C#4');
  });
});
