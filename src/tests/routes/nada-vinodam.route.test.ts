import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('nada vinodam route source', () => {
  it('wires the dedicated controller and renders the console sections', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/nada-vinodam/+page.svelte'), 'utf8');

    expect(source).toContain('createNadaVinodamPageController');
    expect(source).toContain('ReferenceChrome activeTab="nada-vinodam"');
    expect(source).toContain('Nāda Vinōdam');
    expect(source).toContain('Digital Readout');
    expect(source).toContain('Infinite Sustain');
    expect(source).toContain('NadaOscilloscope');
  });
});
