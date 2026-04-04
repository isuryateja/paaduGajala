import type { SvaraEntry, SvaraLibraryResult, SvaraMetadata, SvaraRagaGroup, SvaraValidationError } from './svara-grantham.types';

const rawSvaraModules = import.meta.glob('../../lib/svara-grantham/*.svara', {
  eager: true,
  import: 'default',
  query: '?raw'
}) as Record<string, string>;

const REQUIRED_METADATA_FIELDS = ['id', 'name', 'raga', 'tala', 'notation_format'] as const;
const URL_SAFE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface ParsedFrontmatter {
  metadata: Record<string, string>;
  body: string;
}

interface ParseSuccess {
  ok: true;
  entry: SvaraEntry;
}

interface ParseFailure {
  ok: false;
  error: SvaraValidationError;
}

type ParseResult = ParseSuccess | ParseFailure;

export function loadSvaraLibrary(files: Record<string, string> = rawSvaraModules): SvaraLibraryResult {
  const results = Object.entries(files)
    .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
    .map(([sourcePath, source]) => parseSvaraFile(sourcePath, source));

  const errors = results.flatMap((result) => (result.ok ? [] : [result.error]));
  const candidateEntries = results.flatMap((result) => (result.ok ? [result.entry] : []));
  const idCounts = candidateEntries.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.metadata.id] = (counts[entry.metadata.id] ?? 0) + 1;
    return counts;
  }, {});

  const entries = candidateEntries.filter((entry) => idCounts[entry.metadata.id] === 1);
  const duplicateErrors = candidateEntries
    .filter((entry) => idCounts[entry.metadata.id] > 1)
    .map<SvaraValidationError>((entry) => ({
      sourcePath: entry.sourcePath,
      reason: 'duplicate_id',
      detail: `Duplicate notation id "${entry.metadata.id}" found in library.`
    }));

  return {
    entries: sortSvaraEntries(entries),
    errors: [...errors, ...duplicateErrors]
  };
}

export function buildSvaraRagaGroups(entries: SvaraEntry[], searchText = ''): SvaraRagaGroup[] {
  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredEntries =
    normalizedSearch.length === 0
      ? entries
      : entries.filter((entry) => entry.metadata.name.toLowerCase().includes(normalizedSearch));

  const groups = filteredEntries.reduce<Record<string, SvaraEntry[]>>((accumulator, entry) => {
    const raga = entry.metadata.raga;
    accumulator[raga] = [...(accumulator[raga] ?? []), entry];
    return accumulator;
  }, {});

  return Object.keys(groups)
    .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' }))
    .map((raga) => ({
      raga,
      entries: sortSvaraEntries(groups[raga] ?? [])
    }));
}

export function getFirstSvaraEntryId(entries: SvaraEntry[]): string | null {
  const firstGroup = buildSvaraRagaGroups(entries)[0];
  return firstGroup?.entries[0]?.metadata.id ?? null;
}

export function getEffectiveSvaraBody(entryId: string, originalBody: string, overrides: Record<string, string>): string {
  return overrides[entryId] ?? originalBody;
}

function parseSvaraFile(sourcePath: string, source: string): ParseResult {
  const parsedFrontmatter = splitFrontmatter(source);
  if (!parsedFrontmatter) {
    return {
      ok: false,
      error: {
        sourcePath,
        reason: 'missing_frontmatter',
        detail: 'Expected YAML frontmatter delimited by --- at the top of the file.'
      }
    };
  }

  const metadata = parsedFrontmatter.metadata;
  const missingField = REQUIRED_METADATA_FIELDS.find((field) => !metadata[field]?.trim());
  if (missingField) {
    return {
      ok: false,
      error: {
        sourcePath,
        reason: 'missing_field',
        detail: `Missing required metadata field "${missingField}".`
      }
    };
  }

  if (!URL_SAFE_ID.test(metadata.id)) {
    return {
      ok: false,
      error: {
        sourcePath,
        reason: 'invalid_id',
        detail: `Metadata field "id" must be lowercase, URL-safe, and hyphenated.`
      }
    };
  }

  if (metadata.notation_format !== 'pg_v1') {
    return {
      ok: false,
      error: {
        sourcePath,
        reason: 'unsupported_format',
        detail: `Unsupported notation format "${metadata.notation_format}".`
      }
    };
  }

  if (parsedFrontmatter.body.trim().length === 0) {
    return {
      ok: false,
      error: {
        sourcePath,
        reason: 'empty_body',
        detail: 'Notation body must not be empty.'
      }
    };
  }

  const entry: SvaraEntry = {
    sourcePath,
    body: parsedFrontmatter.body,
    metadata: {
      id: metadata.id,
      name: metadata.name,
      raga: metadata.raga,
      tala: metadata.tala,
      notation_format: 'pg_v1'
    } satisfies SvaraMetadata
  };

  return { ok: true, entry };
}

function splitFrontmatter(source: string): ParsedFrontmatter | null {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return null;
  }

  const [, rawMetadata, body] = match;
  const metadata = rawMetadata
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, line) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      accumulator[key] = stripWrappingQuotes(value);
      return accumulator;
    }, {});

  return { metadata, body };
}

function stripWrappingQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function sortSvaraEntries(entries: SvaraEntry[]): SvaraEntry[] {
  return [...entries].sort((left, right) =>
    left.metadata.name.localeCompare(right.metadata.name, undefined, { sensitivity: 'base' })
  );
}
