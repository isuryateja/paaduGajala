import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('theory route source', () => {
  it('renders the quick builder and sound lab widgets', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/theory/+page.svelte'), 'utf8');

    expect(source).toContain('Raga Nirmāṇa');
    expect(source).toContain('Quick Build');
    expect(source).toContain('Swara Bank');
    expect(source).toContain('Arohanam Sequence');
    expect(source).toContain('href="/raga-nirmana"');
    expect(source).toContain('Nāda Vinōdam');
    expect(source).toContain('Quick Lab');
    expect(source).toContain('Open Sound Lab');
    expect(source).toContain('href="/nada-vinodam"');
  });
});
