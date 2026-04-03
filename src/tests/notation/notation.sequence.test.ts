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
    expect(sequence.totalUnits).toBe(4);
    expect(sequence.sequenceLength).toBe(3);
  });
});
