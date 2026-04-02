import type { PianoKeyDefinition } from './piano.types';

const WHITE_NOTES = [
  { note: 's', label: 'S' },
  { note: 'r2', label: 'R2' },
  { note: 'g3', label: 'G3' },
  { note: 'm1', label: 'M1' },
  { note: 'p', label: 'P' },
  { note: 'd2', label: 'D2' },
  { note: 'n3', label: 'N3' }
];

const BLACK_NOTES = [
  { note: 'r1', label: 'R1' },
  { note: 'g2', label: 'G2' },
  { note: 'm2', label: 'M2' },
  { note: 'd1', label: 'D1' },
  { note: 'n2', label: 'N2' }
];

export const PIANO_KEYS: PianoKeyDefinition[] = ['1', '2', '3'].flatMap((octave) => [
  ...WHITE_NOTES.map((item) => ({ ...item, octave: octave as '1' | '2' | '3', isBlack: false })),
  ...BLACK_NOTES.map((item) => ({ ...item, octave: octave as '1' | '2' | '3', isBlack: true }))
]);
