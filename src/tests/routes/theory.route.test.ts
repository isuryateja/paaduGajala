import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('theory route source', () => {
  it('renders the raga nirmana quick widget and links to the full builder', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/theory/+page.svelte'), 'utf8');

    expect(source).toContain('Raga Nirmāṇa');
    expect(source).toContain('Quick Build');
    expect(source).toContain('Swara Bank');
    expect(source).toContain('Arohanam Sequence');
    expect(source).toContain('href="/raga-nirmana"');
  });
});
