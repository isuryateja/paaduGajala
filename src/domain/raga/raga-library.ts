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
