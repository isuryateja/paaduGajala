import type { PianoKeyboardMapping } from './piano.types';

export const PIANO_KEYBOARD_MAP: Record<string, PianoKeyboardMapping> = {
  a: { note: 's', octave: '1' },
  w: { note: 'r1', octave: '1' },
  s: { note: 'r', octave: '1' },
  e: { note: 'r2', octave: '1' },
  d: { note: 'g', octave: '1' },
  f: { note: 'm', octave: '1' },
  t: { note: 'm1', octave: '1' },
  g: { note: 'p', octave: '1' },
  y: { note: 'd1', octave: '1' },
  h: { note: 'd', octave: '1' },
  u: { note: 'd2', octave: '1' },
  j: { note: 'n', octave: '1' },
  k: { note: 's', octave: '2' },
  o: { note: 'r1', octave: '2' },
  l: { note: 'r', octave: '2' },
  p: { note: 'r2', octave: '2' },
  ';': { note: 'g', octave: '2' },
  "'": { note: 'm', octave: '2' },
  ']': { note: 'm1', octave: '2' },
  '\\': { note: 'p', octave: '2' }
};
