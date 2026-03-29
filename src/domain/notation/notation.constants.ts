import * as legacyNotationModule from '../../../notation_parser.js';

type LegacyNotationModule = {
  SVARA_NOTATION: Record<string, string>;
  SVARA_NAMES: Record<string, string>;
  OCTAVE_NAMES: Record<string, string>;
  RHYTHM_MARKERS: Record<string, string>;
  TOKEN_TYPES: Record<string, string>;
};

const legacyNotation = legacyNotationModule as unknown as LegacyNotationModule;

export const SVARA_NOTATION = legacyNotation.SVARA_NOTATION;
export const SVARA_NAMES = legacyNotation.SVARA_NAMES;
export const OCTAVE_NAMES = legacyNotation.OCTAVE_NAMES;
export const RHYTHM_MARKERS = legacyNotation.RHYTHM_MARKERS;
export const TOKEN_TYPES = legacyNotation.TOKEN_TYPES;
