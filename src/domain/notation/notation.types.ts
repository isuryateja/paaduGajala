import type { OctaveName } from '../shared/types';

export interface NotationToken {
  type:
    | 'svara'
    | 'rhythm_marker'
    | 'sustain_unit'
    | 'beat_rest'
    | 'vega_group_start'
    | 'vega_group_end'
    | 'newline'
    | 'whitespace'
    | 'unknown';
  value?: string;
  svara?: string;
  octave?: OctaveName;
  raw?: string;
  subtype?: 'single' | 'double';
  boundaryKind?: 'beat' | 'phrase';
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
  boundaryKind: 'beat' | 'phrase';
  line: number;
  position: number;
}

export interface SustainUnitNode {
  type: 'sustain_unit';
  units: number;
  line: number;
  position: number;
}

export interface BeatRestNode {
  type: 'beat_rest';
  beats: number;
  line: number;
  position: number;
}

export interface VegaGroupNode {
  type: 'vega_group';
  tokens: Array<ParsedSvara | SustainUnitNode>;
  notes: ParsedSvara[];
  subdivisions: number;
  totalDuration: number;
  line: number;
  position: number;
  endPosition: number;
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

export interface PreviewSustainToken {
  type: 'sustain_unit';
  text: string;
  position: number;
}

export interface PreviewBeatRestToken {
  type: 'beat_rest';
  text: string;
  position: number;
}

export interface PreviewVegaGroupToken {
  type: 'vega_group';
  tokens: Array<PreviewSvaraToken | PreviewSustainToken>;
  position: number;
  endPosition: number;
}

export interface PreviewNewlineToken {
  type: 'newline';
  position: number;
}

export type PreviewNotationToken =
  | PreviewSvaraToken
  | PreviewRhythmToken
  | PreviewSustainToken
  | PreviewBeatRestToken
  | PreviewVegaGroupToken
  | PreviewNewlineToken;

export type ParsedNotationNode =
  | ParsedSvara
  | RhythmMarkerNode
  | SustainUnitNode
  | BeatRestNode
  | VegaGroupNode
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
