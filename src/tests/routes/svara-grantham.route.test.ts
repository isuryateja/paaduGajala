import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('svara grantham route source', () => {
  it('renders the notation library workspace and MVP controls', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/svara-grantham/+page.svelte'), 'utf8');

    expect(source).toContain('Svara Grantham');
    expect(source).toContain('Library Browser');
    expect(source).toContain('Notation Workspace');
    expect(source).toContain('Search by kriti name');
    expect(source).toContain('No matching kritis');
    expect(source).toContain('Local Override');
    expect(source).toContain('Play');
    expect(source).toContain('Pause');
    expect(source).toContain('Copy');
    expect(source).toContain('Edit');
    expect(source).toContain('Reset');
    expect(source).toContain('New Notation');
  });
});
