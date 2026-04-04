import { describe, expect, it } from 'vitest';
import { buildTimedNotationSequence } from '../../domain/notation/notation.sequence';
import { parseNotation } from '../../domain/notation/notation.parser';

describe('timed notation sequence', () => {
  it('turns leading and consecutive beat rests into accumulated silence', () => {
    const sequence = buildTimedNotationSequence(parseNotation(', , S'));

    expect(sequence.items).toEqual([
      expect.objectContaining({ type: 'silence', duration: 2 }),
      expect.objectContaining({ type: 'svara', svara: 'S', duration: 1, originalIndex: 0 })
    ]);
    expect(sequence.totalUnits).toBe(3);
    expect(sequence.sequenceLength).toBe(1);
  });

  it('keeps beat rests independent from sustain extension logic', () => {
    const sequence = buildTimedNotationSequence(parseNotation('S _ , _ G3'));

    expect(sequence.items).toEqual([
      expect.objectContaining({ type: 'svara', svara: 'S', duration: 2, originalIndex: 0 }),
      expect.objectContaining({ type: 'silence', duration: 2 }),
      expect.objectContaining({ type: 'svara', svara: 'G3', duration: 1, originalIndex: 1 })
    ]);
    expect(sequence.totalUnits).toBe(5);
    expect(sequence.sequenceLength).toBe(2);
  });

  it('preserves boundary order around beat rests', () => {
    const sequence = buildTimedNotationSequence(parseNotation('S | , G3 || , R1'));

    expect(sequence.items).toEqual([
      expect.objectContaining({ type: 'svara', svara: 'S', originalIndex: 0 }),
      expect.objectContaining({ type: 'boundary', boundaryKind: 'beat', marker: '|' }),
      expect.objectContaining({ type: 'silence', duration: 1 }),
      expect.objectContaining({ type: 'svara', svara: 'G3', originalIndex: 1 }),
      expect.objectContaining({ type: 'boundary', boundaryKind: 'phrase', marker: '||' }),
      expect.objectContaining({ type: 'silence', duration: 1 }),
      expect.objectContaining({ type: 'svara', svara: 'R1', originalIndex: 2 })
    ]);
    expect(sequence.totalUnits).toBe(5);
    expect(sequence.sequenceLength).toBe(3);
  });

  it('expands Vega groups into fractional svara timings within one beat', () => {
    const sequence = buildTimedNotationSequence(parseNotation('S [R2 G2] , P'));

    expect(sequence.items).toEqual([
      expect.objectContaining({ type: 'svara', svara: 'S', duration: 1, originalIndex: 0 }),
      expect.objectContaining({ type: 'svara', svara: 'R2', duration: 0.5, originalIndex: 1 }),
      expect.objectContaining({ type: 'svara', svara: 'G2', duration: 0.5, originalIndex: 2 }),
      expect.objectContaining({ type: 'silence', duration: 1 }),
      expect.objectContaining({ type: 'svara', svara: 'P', duration: 1, originalIndex: 3 })
    ]);
    expect(sequence.totalUnits).toBe(4);
    expect(sequence.sequenceLength).toBe(4);
  });

  it('treats sustain after a Vega group as silence instead of extending the last grouped note', () => {
    const sequence = buildTimedNotationSequence(parseNotation('[R2 G2] _ S'));

    expect(sequence.items).toEqual([
      expect.objectContaining({ type: 'svara', svara: 'R2', duration: 0.5, originalIndex: 0 }),
      expect.objectContaining({ type: 'svara', svara: 'G2', duration: 0.5, originalIndex: 1 }),
      expect.objectContaining({ type: 'silence', duration: 1 }),
      expect.objectContaining({ type: 'svara', svara: 'S', duration: 1, originalIndex: 2 })
    ]);
    expect(sequence.totalUnits).toBe(3);
    expect(sequence.sequenceLength).toBe(3);
  });

  it('resolves grouped sustain into fractional playable durations inside one beat', () => {
    const sequence = buildTimedNotationSequence(parseNotation('[R2 _ G2 _]'));

    expect(sequence.items).toEqual([
      expect.objectContaining({ type: 'svara', svara: 'R2', duration: 0.5, originalIndex: 0 }),
      expect.objectContaining({ type: 'svara', svara: 'G2', duration: 0.5, originalIndex: 1 })
    ]);
    expect(sequence.totalUnits).toBe(1);
    expect(sequence.sequenceLength).toBe(2);
  });

  it('resolves grouped sustain with uneven subdivisions without overlap', () => {
    const sequence = buildTimedNotationSequence(parseNotation('[R2 _ G2]'));
    const svaraItems = sequence.items.filter((item) => item.type === 'svara');

    expect(svaraItems).toHaveLength(2);
    if (svaraItems[0]?.type === 'svara' && svaraItems[1]?.type === 'svara') {
      expect(svaraItems[0].duration).toBeCloseTo(2 / 3, 10);
      expect(svaraItems[1].duration).toBeCloseTo(1 / 3, 10);
    }
    expect(sequence.totalUnits).toBeCloseTo(1, 10);
    expect(sequence.sequenceLength).toBe(2);
  });
});
