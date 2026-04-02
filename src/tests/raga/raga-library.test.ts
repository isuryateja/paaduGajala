import { describe, expect, it } from 'vitest';
import {
  filterRagas,
  filterRagasBySvaraSequences,
  formatRagaNotation,
  matchesRagaSequences,
  normalizeRagaSequence,
  ragaLibrary
} from '../../domain/raga/raga-library';

describe('raga library', () => {
  it('loads the canonical raga dataset', () => {
    expect(ragaLibrary.length).toBe(179);
    expect(ragaLibrary.some((raga) => raga.name === 'Kalyani')).toBe(true);
  });

  it('filters ragas by case-insensitive contains search', () => {
    const matches = filterRagas('bha').map((raga) => raga.name);
    expect(matches).toContain('Bhairavi');
    expect(matches).toContain('Ananda Bhairavi');
    expect(matches).toContain('Sindhu Bhairavi');
    expect(matches).toContain('Natabhairavi');
  });

  it('excludes ragas without notation text from the picker results', () => {
    expect(filterRagas('').some((raga) => raga.name === 'Yamuna Kalyani')).toBe(false);
  });

  it('formats arohanam and avarohanam as notation input text', () => {
    const kalyani = ragaLibrary.find((raga) => raga.name === 'Kalyani');
    expect(kalyani).toBeDefined();
    expect(formatRagaNotation(kalyani!)).toBe("S R2 G3 M2 P D2 N3 S'\nS' N3 D2 P M2 G3 R2 S");
  });

  it('normalizes octave markers out of raga sequences', () => {
    expect(normalizeRagaSequence("S' N2 D2 P M1 G3 R2 S")).toEqual(['S', 'N2', 'D2', 'P', 'M1', 'G3', 'R2', 'S']);
  });

  it('filters ragas by partial arohanam and avarohanam prefixes', () => {
    const matches = filterRagasBySvaraSequences({
      arohanam: ['S', 'R2', 'G3', 'P'],
      avarohanam: ['S', 'D2', 'P']
    }).map((raga) => raga.name);

    expect(matches).toContain('Mohanam');
    expect(matches).not.toContain('Hamsadhvani');
  });

  it('supports exact sequence matching when both builders are complete', () => {
    const mohanam = ragaLibrary.find((raga) => raga.name === 'Mohanam');
    expect(mohanam).toBeDefined();
    expect(
      matchesRagaSequences(
        mohanam!,
        {
          arohanam: ['S', 'R2', 'G3', 'P', 'D2', 'S'],
          avarohanam: ['S', 'D2', 'P', 'G3', 'R2', 'S']
        },
        'exact'
      )
    ).toBe(true);
    expect(
      matchesRagaSequences(
        mohanam!,
        {
          arohanam: ['S', 'R2', 'G3', 'M1'],
          avarohanam: ['S', 'D2', 'P', 'G3', 'R2', 'S']
        },
        'exact'
      )
    ).toBe(false);
  });
});
