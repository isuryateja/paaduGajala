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
    expect(source).toContain('Svara Grantham');
    expect(source).toContain("href: '/svara-grantham'");
    expect(source).toContain('Designed with love by Nemigna');
    expect(source).not.toContain('Masooria');
    expect(source).toContain('Raga Search');
    expect(source).toContain('role="combobox"');
    expect(source).toContain('Locked Compact Range');
    expect(source).toContain("label: 'N1.'");
    expect(source).toContain("label: 'N2.'");
    expect(source).toContain('secondaryLabel: \'D3.\'');
    expect(source).toContain('secondaryLabel: "G1\'"');
  });

  it('wires reverb mix slider and space preset to settings actions (P2B-02)', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/+page.svelte'), 'utf8');
    expect(source).toContain('id="reverb-range"');
    expect(source).toContain('updateReverbMix');
    expect(source).toContain('$settingsStore.reverbMix');
    expect(source).toContain('id="reverb-preset-select"');
    expect(source).toContain('updateReverbPreset');
    expect(source).toContain('$settingsStore.reverbPreset');
    // Local decorative state removed — store is the source of truth.
    expect(source).not.toContain('reverbLevel');
  });

  it('swaps the notation editor for the playback highlighter only while playing', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/+page.svelte'), 'utf8');
    expect(source).toContain("PlaybackNotationHighlighter");
    expect(source).toContain("{#if $playbackStore.status === 'playing'}");
    expect(source).toContain('<section class="notation-panel">');
    expect(source).toContain("highlightedIndex={$playbackStore.currentIndex}");
  });

  it('keeps sruti-to-swara as a placeholder route and wires theory to the quick builder widget', () => {
    const srutiToSwara = readFileSync(resolve(process.cwd(), 'src/routes/sruti-to-swara/+page.svelte'), 'utf8');
    const theory = readFileSync(resolve(process.cwd(), 'src/routes/theory/+page.svelte'), 'utf8');

    expect(srutiToSwara).toContain('PlaceholderWorkspace');
    expect(theory).toContain('Raga Nirmāṇa');
    expect(theory).toContain('Quick Build');
    expect(theory).toContain('Open Full Builder');
  });
});
