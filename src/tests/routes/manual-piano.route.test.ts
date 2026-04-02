import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolveManualPianoPointerKey } from '../../app/services/manual-piano-hit-test';

const whiteKeys = [
  { note: 'n1', octave: '1' },
  { note: 'n3', octave: '1' },
  { note: 's', octave: '2' },
  { note: 'r2', octave: '2' },
  { note: 'g3', octave: '2' },
  { note: 'm1', octave: '2' },
  { note: 'p', octave: '2' },
  { note: 'd2', octave: '2' },
  { note: 'n3', octave: '2' },
  { note: 's', octave: '3' },
  { note: 'r2', octave: '3' }
];

const blackKeys = [
  { note: 'n2', octave: '1', left: 9.09 },
  { note: 'r1', octave: '2', left: 27.27 },
  { note: 'g2', octave: '2', left: 36.36 },
  { note: 'm2', octave: '2', left: 54.55 },
  { note: 'd1', octave: '2', left: 63.64 },
  { note: 'n2', octave: '2', left: 72.73 },
  { note: 'r1', octave: '3', left: 90.91 }
];

describe('manual piano hit testing', () => {
  it('resolves the M1 lower key area to the white key even under the M2 x-overlap', () => {
    const hit = resolveManualPianoPointerKey({
      clientX: 600,
      clientY: 220,
      keybedRect: { left: 0, top: 0, width: 1136, height: 320 },
      whiteKeys,
      blackKeys,
      blackKeyWidthPercent: 5.25,
      blackKeyHeightPercent: 54
    });

    expect(hit).toEqual({ note: 'm1', octave: '2' });
  });

  it('resolves the black key only inside the black key zone', () => {
    const hit = resolveManualPianoPointerKey({
      clientX: 600,
      clientY: 80,
      keybedRect: { left: 0, top: 0, width: 1136, height: 320 },
      whiteKeys,
      blackKeys,
      blackKeyWidthPercent: 5.25,
      blackKeyHeightPercent: 54
    });

    expect(hit).toEqual({ note: 'm2', octave: '2', left: 54.55 });
  });
});

describe('manual piano route wiring', () => {
  it('routes pointer interaction through the shared keybed instead of per-key pointer handlers', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/routes/+page.svelte'), 'utf8');

    expect(source).toContain('bind:this={pianoKeybed}');
    expect(source).toContain('on:pointerdown={handleKeybedPointerDown}');
    expect(source).toContain('on:pointerup={handleKeybedPointerUp}');
    expect(source).toContain('data-note={key.note}');
    expect(source).toContain('data-octave={key.octave}');
    expect(source).not.toContain('on:pointerdown={(e) => handleKeyDown(e, key.note, key.octave)}');
  });
});
