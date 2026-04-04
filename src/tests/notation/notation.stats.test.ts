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

  it('includes sustain-driven note extension and leading silence in preview duration', () => {
    const previewStats = getNotationPreviewStats('_ _ S R1 | G3 _ ||', 60);

    expect(previewStats.totalBeats).toBe(6);
    expect(previewStats.durationSeconds).toBe(6);
    expect(previewStats.octavesUsed).toBe(1);
  });

  it('includes beat rests in preview duration using tempo-scaled beat counts', () => {
    const previewStats = getNotationPreviewStats('S , , R1 || , G3', 120);

    expect(previewStats.totalBeats).toBe(6);
    expect(previewStats.durationSeconds).toBe(3);
    expect(previewStats.octavesUsed).toBe(1);
  });

  it('counts Vega groups as one beat while still counting inner svaras', () => {
    const stats = getNotationStats('S [R2 G2 R2 S] P');
    const previewStats = getNotationPreviewStats('S [R2 G2 R2 S] P', 120);

    expect(stats.totalNotes).toBe(6);
    expect(stats.svaraCounts.R2).toBe(2);
    expect(stats.svaraCounts.G2).toBe(1);
    expect(stats.svaraCounts.S).toBe(2);
    expect(previewStats.totalBeats).toBe(3);
    expect(previewStats.durationSeconds).toBe(1.5);
  });
});
