import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getNotationPreviewStats, getNotationStats } from '../../domain/notation/notation.stats';

describe('notation stats', () => {
  it('counts note content from notation text', () => {
    const stats = getNotationStats('S R1 G1 M1 ||');
    expect(stats.totalNotes).toBeGreaterThan(0);
  });

  it('preserves line and octave distribution stats from the bundled example', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/tests/notation/fixtures/example-input.txt'), 'utf8');
    const stats = getNotationStats(source);

    expect(stats.lines).toBe(10);
    expect(stats.totalNotes).toBeGreaterThan(0);
    expect(stats.totalRhythmMarkers).toBe(30);
    expect(stats.octaveDistribution.taara).toBe(4);
  });

  it('computes preview-oriented duration and octave counts from svara content', () => {
    const previewStats = getNotationPreviewStats("S R1 G1 M1\nS' ||", 120);

    expect(previewStats.totalBeats).toBe(5);
    expect(previewStats.durationSeconds).toBe(2.5);
    expect(previewStats.octavesUsed).toBe(2);
  });
});
