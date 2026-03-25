import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('main player route source', () => {
  it('composes the planned route cards', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/+page.svelte'), 'utf8');
    expect(source).toContain('NotationInputCard');
    expect(source).toContain('PlaybackControlsCard');
    expect(source).toContain('SettingsCard');
    expect(source).toContain('ParsedNotationCard');
    expect(source).toContain('StatisticsCard');
    expect(source).toContain('PianoCard');
  });
});
