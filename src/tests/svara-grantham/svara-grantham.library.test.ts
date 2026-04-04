import { describe, expect, it } from 'vitest';
import {
  buildSvaraRagaGroups,
  getEffectiveSvaraBody,
  getFirstSvaraEntryId,
  loadSvaraLibrary
} from '../../domain/svara-grantham/svara-grantham.library';

describe('svara grantham library', () => {
  it('loads seeded .svara files from the repository library', () => {
    const result = loadSvaraLibrary();

    expect(result.entries.length).toBeGreaterThanOrEqual(3);
    expect(result.entries.some((entry) => entry.metadata.name === 'Endaro Mahanubhavulu')).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('skips invalid entries and rejects duplicate ids', () => {
    const result = loadSvaraLibrary({
      '/mock/valid-a.svara': `---
id: duplicate-piece
name: Duplicate Piece A
raga: Shree
tala: Adi Tala
notation_format: pg_v1
---
PALLAVI
S R G M ||`,
      '/mock/valid-b.svara': `---
id: duplicate-piece
name: Duplicate Piece B
raga: Hamsadhwani
tala: Rupaka Tala
notation_format: pg_v1
---
PALLAVI
S R G P ||`,
      '/mock/invalid.svara': `---
id: broken-piece
name: Broken Piece
raga: Hamsadhwani
tala: Adi Tala
notation_format: pg_v2
---
PALLAVI
S R G P ||`
    });

    expect(result.entries).toEqual([]);
    expect(result.errors.map((error) => error.reason).sort()).toEqual([
      'duplicate_id',
      'duplicate_id',
      'unsupported_format'
    ]);
  });

  it('preserves raw notation formatting in the parsed body', () => {
    const result = loadSvaraLibrary({
      '/mock/preserved.svara': `---
id: preserved-body
name: Preserved Body
raga: Madhyamavati
tala: Adi Tala
notation_format: pg_v1
---
PALLAVI
S  R  M  P ||

CHARANAM
S , , P ||`
    });

    expect(result.entries[0]?.body).toBe(`PALLAVI
S  R  M  P ||

CHARANAM
S , , P ||`);
  });

  it('groups entries by raga and sorts both groups and kritis alphabetically', () => {
    const result = loadSvaraLibrary({
      '/mock/b.svara': `---
id: piece-b
name: Zeta Kriti
raga: Kalyani
tala: Adi Tala
notation_format: pg_v1
---
PALLAVI
S R G M ||`,
      '/mock/a.svara': `---
id: piece-a
name: Alpha Kriti
raga: Bhairavi
tala: Adi Tala
notation_format: pg_v1
---
PALLAVI
S R G M ||`,
      '/mock/c.svara': `---
id: piece-c
name: Beta Kriti
raga: Kalyani
tala: Adi Tala
notation_format: pg_v1
---
PALLAVI
S R G M ||`
    });

    const groups = buildSvaraRagaGroups(result.entries);

    expect(groups.map((group) => group.raga)).toEqual(['Bhairavi', 'Kalyani']);
    expect(groups[1]?.entries.map((entry) => entry.metadata.name)).toEqual(['Beta Kriti', 'Zeta Kriti']);
  });

  it('filters by kriti name and resolves effective bodies from overrides', () => {
    const result = loadSvaraLibrary({
      '/mock/sample.svara': `---
id: sample-kriti
name: Sample Kriti
raga: Saveri
tala: Adi Tala
notation_format: pg_v1
---
PALLAVI
S R G M ||`
    });

    const groups = buildSvaraRagaGroups(result.entries, 'sample');
    const entry = result.entries[0];

    expect(getFirstSvaraEntryId(result.entries)).toBe('sample-kriti');
    expect(groups).toHaveLength(1);
    expect(groups[0]?.entries[0]?.metadata.id).toBe('sample-kriti');
    expect(getEffectiveSvaraBody(entry!.metadata.id, entry!.body, { 'sample-kriti': 'OVERRIDDEN' })).toBe('OVERRIDDEN');
  });
});
