import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('route boundary structure', () => {
  it('keeps the main route dependent on service/controller modules instead of direct app actions', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/+page.svelte'), 'utf8');
    expect(source).toContain('app/services/main-player-page');
    expect(source).not.toContain("app/actions/notation.actions");
    expect(source).not.toContain("app/actions/playback.actions");
    expect(source).not.toContain("app/actions/settings.actions");
  });

  it('keeps the standalone piano route dependent on its page controller instead of direct browser listeners', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/piano/+page.svelte'), 'utf8');
    expect(source).toContain('app/services/piano-page');
    expect(source).not.toContain('window.addEventListener');
    expect(source).not.toContain('app/actions/piano.actions');
  });
});
