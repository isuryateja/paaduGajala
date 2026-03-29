import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('standalone piano route source', () => {
  it('wires keyboard handlers and release cleanup into the route', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/piano/+page.svelte'), 'utf8');
    expect(source).toContain('createPianoPageController');
    expect(source).toContain('controller.mount()');
    expect(source).toContain('controller.activeKeys.subscribe');
    expect(source).not.toContain('window.addEventListener');
  });
});
