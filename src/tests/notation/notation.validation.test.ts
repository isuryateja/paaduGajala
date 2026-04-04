import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateNotation } from '../../domain/notation/notation.validation';

describe('notation validation', () => {
  it('accepts valid notation', () => {
    expect(validateNotation('S R1 G1 M1 ||').valid).toBe(true);
  });

  it('surfaces legacy unknown-character warnings for malformed input', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/tests/notation/fixtures/invalid-input.txt'), 'utf8');
    const result = validateNotation(source);

    expect(result.valid).toBe(false);
    expect(result.hasSvara).toBe(false);
    expect(result.issues.some((issue) => issue.message.includes('Unknown character'))).toBe(true);
    expect(result.issues.some((issue) => issue.message === 'No svara notation found in input')).toBe(true);
  });

  it('accepts sustain markers as valid notation syntax', () => {
    const result = validateNotation('_ _ S ||');

    expect(result.valid).toBe(true);
    expect(result.issues.some((issue) => issue.message.includes('Unknown character'))).toBe(false);
  });

  it('accepts beat rests as valid notation syntax', () => {
    const result = validateNotation(', S , R1');

    expect(result.valid).toBe(true);
    expect(result.issues.some((issue) => issue.message.includes('Unknown character'))).toBe(false);
  });

  it('does not treat sustain-only input as playable notation', () => {
    const result = validateNotation('_ _ _');

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual([expect.objectContaining({ message: 'No svara notation found in input' })]);
  });

  it('does not treat rest-only input as playable notation', () => {
    const result = validateNotation(', ,');

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual([expect.objectContaining({ message: 'No svara notation found in input' })]);
  });

  it('accepts Vega groups containing only svaras', () => {
    const result = validateNotation('[R2 G2 R2 S] P');

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('rejects empty, nested, mixed-token, and unclosed Vega groups', () => {
    expect(validateNotation('[]').issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining('Empty Vega group') })])
    );
    expect(validateNotation('[R2 [G2 R2] S]').issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining('Nested Vega groups are not supported') })])
    );
    expect(validateNotation('[R2 , G2]').issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining('Only svaras and sustain are allowed inside a Vega group') })])
    );
    expect(validateNotation('[R2 G2').issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ message: expect.stringContaining('Unclosed Vega group') })])
    );
  });

  it('accepts grouped sustain only after a grouped svara', () => {
    const result = validateNotation('[R2 _ G2 _]');

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('rejects grouped sustain without a prior grouped svara', () => {
    expect(validateNotation('[_]').issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: expect.stringContaining('requires a prior grouped svara') })
      ])
    );
    expect(validateNotation('[_ R2]').issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: expect.stringContaining('requires a prior grouped svara') })
      ])
    );
    expect(validateNotation('[_ _ R2]').issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: expect.stringContaining('requires a prior grouped svara') })
      ])
    );
  });
});
