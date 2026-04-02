import { describe, expect, it } from 'vitest';
import { filterRagas, formatRagaNotation, ragaLibrary } from '../../domain/raga/raga-library';

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
});
