import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('playback notation highlighter source', () => {
  it('renders from parsed notation tokens and auto-scrolls the active token', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/notation/PlaybackNotationHighlighter.svelte'),
      'utf8'
    );

    expect(source).toContain('buildPreviewNotationTokens');
    expect(source).toContain('scrollIntoView');
    expect(source).toContain('data-note-index={token.noteIndex}');
    expect(source).toContain("token.type === 'vega_group'");
    expect(source).toContain("groupedToken.type === 'svara'");
    expect(source).toContain('data-note-index={groupedToken.noteIndex}');
    expect(source).toContain("behavior: 'smooth'");
  });
});
