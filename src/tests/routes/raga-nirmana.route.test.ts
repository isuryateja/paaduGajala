import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('raga nirmana route source', () => {
  it('renders the musical construction workspace', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/raga-nirmana/+page.svelte'), 'utf8');

    expect(source).toContain('Raga Nirmāṇa');
    expect(source).toContain('Swara Bank');
    expect(source).toContain('{ label: "S\'", tone: \'rust\' }');
    expect(source).toContain('Arohanam (Ascending)');
    expect(source).toContain('Avarohanam (Descending)');
    expect(source).toContain('Real-time elimination, not search');
    expect(source).toContain('No matching ragas. Try adjusting swaras.');
  });

  it('uses sequence-based filtering rather than text search', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/raga-nirmana/+page.svelte'), 'utf8');

    expect(source).toContain('filterRagasBySvaraSequences');
    expect(source).toContain("matchesRagaSequences(raga, sequenceFilters, 'exact')");
    expect(source).toContain('handleBuilderDrop');
    expect(source).toContain('moveSelected');
  });
});
