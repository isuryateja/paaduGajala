import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('main player route source', () => {
  it('matches the reference layout sections', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/+page.svelte'), 'utf8');
    expect(source).toContain('Swaram Manuscript');
    expect(source).toContain('Tone &amp; Tuning');
    expect(source).toContain('Virtual Swara Piano');
    expect(source).toContain('Swara to Sruti');
    expect(source).toContain('Locked Compact Range');
    expect(source).toContain("label: 'N1.'");
    expect(source).toContain("label: 'N2.'");
    expect(source).toContain('secondaryLabel: \'D3.\'');
    expect(source).toContain('secondaryLabel: "G1\'"');
  });

  it('keeps the non-primary tabs as placeholder routes', () => {
    const srutiToSwara = readFileSync(resolve(process.cwd(), 'src/routes/sruti-to-swara/+page.svelte'), 'utf8');
    const theory = readFileSync(resolve(process.cwd(), 'src/routes/theory/+page.svelte'), 'utf8');

    expect(srutiToSwara).toContain('PlaceholderWorkspace');
    expect(theory).toContain('PlaceholderWorkspace');
  });
});
