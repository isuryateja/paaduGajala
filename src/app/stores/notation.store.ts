import { writable } from 'svelte/store';
import type { ParsedNotationNode, NotationValidationResult } from '../../domain/notation/notation.types';

export interface NotationStats {
  totalNotes: number;
  totalRhythmMarkers: number;
  svaraCounts: Record<string, number>;
  octaveDistribution: Record<string, number>;
  lines: number;
}

export interface NotationState {
  source: 'manual' | 'example' | 'file';
  rawText: string;
  parsed: ParsedNotationNode[];
  validation: NotationValidationResult | null;
  stats: NotationStats | null;
}

export const notationStore = writable<NotationState>({
  source: 'manual',
  rawText: '',
  parsed: [],
  validation: null,
  stats: null
});
