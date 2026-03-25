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
});
