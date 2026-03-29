import * as legacyNotationModule from '../../../notation_parser.js';
import { parseSvarasOnly } from './notation.parser';

type LegacyStats = {
  totalNotes: number;
  totalRhythmMarkers: number;
  svaraCounts: Record<string, number>;
  octaveDistribution: Record<string, number>;
  lines: number;
};

type LegacyNotationModule = {
  getNotationStats: (text: string) => LegacyStats;
};

const legacyNotation = legacyNotationModule as unknown as LegacyNotationModule;

export function getNotationStats(text: string): LegacyStats {
  return legacyNotation.getNotationStats(text);
}

export function getNotationPreviewStats(text: string, tempo: number): { totalBeats: number; durationSeconds: number; octavesUsed: number } {
  const svaras = parseSvarasOnly(text);
  const totalBeats = svaras.reduce((sum, note) => sum + (note.duration || 1), 0);
  const octavesUsed = new Set(svaras.map((note) => note.octave)).size;

  return {
    totalBeats,
    durationSeconds: (totalBeats * 60) / tempo,
    octavesUsed
  };
}
