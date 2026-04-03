import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildPreviewNotationTokens, parseNotation, parseSvarasOnly } from '../../domain/notation/notation.parser';

describe('notation parser', () => {
  it('parses svara tokens from the example phrase', () => {
    const parsed = parseNotation('S R1 G1 M1 | P D1 N1 ||');
    expect(parsed.filter((node) => node.type === 'svara')).toHaveLength(7);
  });

  it('preserves beat and phrase separator semantics in order', () => {
    const parsed = parseNotation('S S R1 R1 | G3 G3 | M1 M1 ||');
    const markers = parsed.filter((node) => node.type === 'rhythm_marker');

    expect(markers).toEqual([
      expect.objectContaining({ marker: '|', subtype: 'single', boundaryKind: 'beat' }),
      expect.objectContaining({ marker: '|', subtype: 'single', boundaryKind: 'beat' }),
      expect.objectContaining({ marker: '||', subtype: 'double', boundaryKind: 'phrase' })
    ]);
  });

  it('normalizes unicode dandas to canonical playback markers', () => {
    const parsed = parseNotation('S R1 G3 । M1 P ॥');
    const markers = parsed.filter((node) => node.type === 'rhythm_marker');

    expect(markers).toEqual([
      expect.objectContaining({ marker: '|', boundaryKind: 'beat' }),
      expect.objectContaining({ marker: '||', boundaryKind: 'phrase' })
    ]);
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

  it('accepts a trailing beat separator without adding playable content', () => {
    const parsed = parseNotation('S R1 G3 |');
    const markers = parsed.filter((node) => node.type === 'rhythm_marker');

    expect(parsed.filter((node) => node.type === 'svara')).toHaveLength(3);
    expect(markers).toEqual([expect.objectContaining({ marker: '|', boundaryKind: 'beat' })]);
  });

  it('preserves sustain units in order and folds note-following sustain into svara-only durations', () => {
    const parsed = parseNotation('S _ _ R1 | _ G3 _');
    const sustainUnits = parsed.filter((node) => node.type === 'sustain_unit');
    const svaras = parseSvarasOnly('S _ _ R1 | _ G3 _');

    expect(sustainUnits).toHaveLength(4);
    expect(parsed.map((node) => node.type)).toEqual([
      'svara',
      'sustain_unit',
      'sustain_unit',
      'svara',
      'rhythm_marker',
      'sustain_unit',
      'svara',
      'sustain_unit'
    ]);
    expect(svaras).toEqual([
      expect.objectContaining({ svara: 'S', duration: 3 }),
      expect.objectContaining({ svara: 'R1', duration: 1 }),
      expect.objectContaining({ svara: 'G3', duration: 2 })
    ]);
  });

  it('keeps sustain markers visible in preview output without shifting note indexes', () => {
    const preview = buildPreviewNotationTokens(parseNotation('_ S _ | G3'));
    const previewKinds = preview.map((token) => token.type);
    const svaraPreview = preview.filter((token) => token.type === 'svara');

    expect(previewKinds).toEqual(['sustain_unit', 'svara', 'sustain_unit', 'rhythm_marker', 'svara']);
    expect(svaraPreview).toEqual([
      expect.objectContaining({ text: 'S', noteIndex: 0 }),
      expect.objectContaining({ text: 'G3', noteIndex: 1 })
    ]);
  });

  it('parses beat rests as explicit notation nodes without affecting svara indexing', () => {
    const parsed = parseNotation('S , R1 || , G3');
    const preview = buildPreviewNotationTokens(parsed);
    const beatRests = parsed.filter((node) => node.type === 'beat_rest');
    const previewKinds = preview.map((token) => token.type);
    const svaraPreview = preview.filter((token) => token.type === 'svara');

    expect(beatRests).toEqual([
      expect.objectContaining({ type: 'beat_rest', beats: 1 }),
      expect.objectContaining({ type: 'beat_rest', beats: 1 })
    ]);
    expect(previewKinds).toEqual(['svara', 'beat_rest', 'svara', 'rhythm_marker', 'beat_rest', 'svara']);
    expect(svaraPreview).toEqual([
      expect.objectContaining({ text: 'S', noteIndex: 0 }),
      expect.objectContaining({ text: 'R1', noteIndex: 1 }),
      expect.objectContaining({ text: 'G3', noteIndex: 2 })
    ]);
  });
});
