import type { OctaveName } from '../shared/types';

export interface NotationToken {
  type: 'svara' | 'rhythm_marker' | 'newline' | 'whitespace' | 'unknown';
  value?: string;
  svara?: string;
  octave?: OctaveName;
  raw?: string;
  subtype?: 'single' | 'double';
  position: number;
}

export interface ParsedSvara {
  type: 'svara';
  svara: string;
  svaraName?: string;
  svaraLatin?: string;
  octave: OctaveName;
  duration: number;
  beatMarker: string | null;
  line: number;
  position: number;
}

export interface RhythmMarkerNode {
  type: 'rhythm_marker';
  marker: string;
  subtype: 'single' | 'double';
  line: number;
  position: number;
}

export interface NewlineNode {
  type: 'newline';
  line: number;
  position: number;
}

export interface WhitespaceNode {
  type: 'whitespace';
  line: number;
  position: number;
}

export interface UnknownNode {
  type: 'unknown';
  value: string;
  line: number;
  position: number;
}

export interface PreviewSvaraToken {
  type: 'svara';
  text: string;
  octaveDisplay: 'sub' | 'sup' | null;
  noteIndex: number;
  position: number;
}

export interface PreviewRhythmToken {
  type: 'rhythm_marker';
  text: string;
  position: number;
}

export interface PreviewNewlineToken {
  type: 'newline';
  position: number;
}

export type PreviewNotationToken = PreviewSvaraToken | PreviewRhythmToken | PreviewNewlineToken;

export type ParsedNotationNode =
  | ParsedSvara
  | RhythmMarkerNode
  | NewlineNode
  | WhitespaceNode
  | UnknownNode;

export interface NotationValidationIssue {
  type: 'warning' | 'error';
  message: string;
  position?: number;
}

export interface NotationValidationResult {
  valid: boolean;
  issues: NotationValidationIssue[];
  hasSvara?: boolean;
  hasRhythmMarker?: boolean;
}
