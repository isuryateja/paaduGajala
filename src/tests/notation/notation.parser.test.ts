import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildPreviewNotationTokens, parseNotation } from '../../domain/notation/notation.parser';

describe('notation parser', () => {
  it('parses svara tokens from the example phrase', () => {
    const parsed = parseNotation('S R1 G1 M1 | P D1 N1 ||');
    expect(parsed.filter((node) => node.type === 'svara')).toHaveLength(7);
  });

  it('preserves line structure and octave markers for multiline input', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/tests/notation/fixtures/multiline-input.txt'), 'utf8');
    const parsed = parseNotation(source);
    const svaras = parsed.filter((node) => node.type === 'svara');
    const newlines = parsed.filter((node) => node.type === 'newline');

    expect(newlines).toHaveLength(1);
    expect(svaras).toHaveLength(16);
    expect(svaras.at(-1)?.octave).toBe('taara');
    expect(svaras.at(-1)?.beatMarker).toBe('||');
  });

  it('builds preview tokens that match legacy note indexing and octave display', () => {
    const preview = buildPreviewNotationTokens(parseNotation("S R1 G1\nS' ||"));
    const svaraPreview = preview.filter((token) => token.type === 'svara');

    expect(svaraPreview).toHaveLength(4);
    expect(svaraPreview[0]).toMatchObject({ text: 'S', noteIndex: 0, octaveDisplay: null });
    expect(svaraPreview[3]).toMatchObject({ text: 'S', noteIndex: 3, octaveDisplay: 'sup' });
  });
});
