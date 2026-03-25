export interface PianoKeyDefinition {
  note: string;
  label: string;
  octave: '1' | '2' | '3';
  isBlack: boolean;
}

export interface PianoKeyboardMapping {
  note: string;
  octave: '1' | '2' | '3';
}
