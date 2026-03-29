import type { PianoKeyDefinition } from './piano.types';

const WHITE_NOTES = [
  { note: 's', label: 'S' },
  { note: 'r', label: 'R' },
  { note: 'g', label: 'G' },
  { note: 'm', label: 'M' },
  { note: 'p', label: 'P' },
  { note: 'd', label: 'D' },
  { note: 'n', label: 'N' }
];

const BLACK_NOTES = [
  { note: 'r1', label: 'R1' },
  { note: 'r2', label: 'R2' },
  { note: 'm1', label: 'M1' },
  { note: 'd1', label: 'D1' },
  { note: 'd2', label: 'D2' }
];

export const PIANO_KEYS: PianoKeyDefinition[] = ['1', '2', '3'].flatMap((octave) => [
  ...WHITE_NOTES.map((item) => ({ ...item, octave: octave as '1' | '2' | '3', isBlack: false })),
  ...BLACK_NOTES.map((item) => ({ ...item, octave: octave as '1' | '2' | '3', isBlack: true }))
]);
