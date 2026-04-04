export type SvaraNotationFormat = 'pg_v1';

export interface SvaraMetadata {
  id: string;
  name: string;
  raga: string;
  tala: string;
  notation_format: SvaraNotationFormat;
}

export interface SvaraEntry {
  metadata: SvaraMetadata;
  body: string;
  sourcePath: string;
}

export type SvaraValidationErrorReason =
  | 'missing_frontmatter'
  | 'missing_field'
  | 'unsupported_format'
  | 'empty_body'
  | 'invalid_id'
  | 'duplicate_id';

export interface SvaraValidationError {
  sourcePath: string;
  reason: SvaraValidationErrorReason;
  detail: string;
}

export interface SvaraLibraryResult {
  entries: SvaraEntry[];
  errors: SvaraValidationError[];
}

export interface SvaraRagaGroup {
  raga: string;
  entries: SvaraEntry[];
}
