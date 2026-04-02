import type { PianoKeyboardMapping } from './piano.types';

export const PIANO_KEYBOARD_MAP: Record<string, PianoKeyboardMapping> = {
  a: { note: 's', octave: '1' },
  w: { note: 'r1', octave: '1' },
  s: { note: 'r2', octave: '1' },
  e: { note: 'g2', octave: '1' },
  d: { note: 'g3', octave: '1' },
  f: { note: 'm1', octave: '1' },
  t: { note: 'm2', octave: '1' },
  g: { note: 'p', octave: '1' },
  y: { note: 'd1', octave: '1' },
  h: { note: 'd2', octave: '1' },
  u: { note: 'n2', octave: '1' },
  j: { note: 'n3', octave: '1' },
  k: { note: 's', octave: '2' },
  o: { note: 'r1', octave: '2' },
  l: { note: 'r2', octave: '2' },
  p: { note: 'g2', octave: '2' },
  ';': { note: 'g3', octave: '2' },
  "'": { note: 'm1', octave: '2' },
  ']': { note: 'm2', octave: '2' },
  '\\': { note: 'p', octave: '2' }
};
