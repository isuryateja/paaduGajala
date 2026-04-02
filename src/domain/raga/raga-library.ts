import { normalizeSvaraName } from '../pitch/svara-normalization';
import ragaData from '../../../carnatic_ragas.json';

export interface RagaLibraryEntry {
  name: string;
  type: 'Janya' | 'Melakarta';
  parent_raga?: string;
  mela_number?: number;
  arohanam: string;
  avarohanam: string;
}

interface RagaLibraryData {
  ragas: RagaLibraryEntry[];
}

const library = ragaData as RagaLibraryData;

export const ragaLibrary: RagaLibraryEntry[] = [...library.ragas].sort((left, right) =>
  left.name.localeCompare(right.name, 'en', { sensitivity: 'base' })
);

export const searchableRagaLibrary: RagaLibraryEntry[] = ragaLibrary.filter(
  (raga) => Boolean(raga.arohanam.trim()) || Boolean(raga.avarohanam.trim())
);

export interface RagaSequenceFilter {
  arohanam?: string[];
  avarohanam?: string[];
}

function stripOctaveMarkers(token: string): string {
  return token.replace(/[.'"]/g, '');
}

export function normalizeRagaSequence(sequence: string | string[]): string[] {
  const rawTokens = Array.isArray(sequence) ? sequence : sequence.trim().split(/\s+/);

  return rawTokens
    .map((token) => stripOctaveMarkers(token.trim()))
    .filter(Boolean)
    .map((token) => normalizeSvaraName(token));
}

function matchesPrefix(candidate: string[], query: string[]): boolean {
  if (query.length > candidate.length) {
    return false;
  }

  return query.every((svara, index) => candidate[index] === svara);
}

export function matchesRagaSequences(
  raga: RagaLibraryEntry,
  filters: RagaSequenceFilter,
  matchMode: 'prefix' | 'exact' = 'prefix'
): boolean {
  const arohanamFilter = normalizeRagaSequence(filters.arohanam ?? []);
  const avarohanamFilter = normalizeRagaSequence(filters.avarohanam ?? []);
  const arohanamTokens = normalizeRagaSequence(raga.arohanam);
  const avarohanamTokens = normalizeRagaSequence(raga.avarohanam);

  if (arohanamFilter.length > 0) {
    const arohanamMatches =
      matchMode === 'exact'
        ? arohanamTokens.length === arohanamFilter.length && matchesPrefix(arohanamTokens, arohanamFilter)
        : matchesPrefix(arohanamTokens, arohanamFilter);

    if (!arohanamMatches) {
      return false;
    }
  }

  if (avarohanamFilter.length > 0) {
    const avarohanamMatches =
      matchMode === 'exact'
        ? avarohanamTokens.length === avarohanamFilter.length && matchesPrefix(avarohanamTokens, avarohanamFilter)
        : matchesPrefix(avarohanamTokens, avarohanamFilter);

    if (!avarohanamMatches) {
      return false;
    }
  }

  return true;
}

export function filterRagasBySvaraSequences(filters: RagaSequenceFilter): RagaLibraryEntry[] {
  return searchableRagaLibrary.filter((raga) => matchesRagaSequences(raga, filters));
}

export function filterRagas(query: string): RagaLibraryEntry[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return searchableRagaLibrary;
  }

  return searchableRagaLibrary.filter((raga) => raga.name.toLowerCase().includes(normalizedQuery));
}

export function formatRagaNotation(raga: RagaLibraryEntry): string {
  return [raga.arohanam.trim(), raga.avarohanam.trim()].filter(Boolean).join('\n');
}
