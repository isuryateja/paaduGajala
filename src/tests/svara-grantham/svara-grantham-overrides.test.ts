import { describe, expect, it } from 'vitest';
import {
  readSvaraGranthamOverrides,
  SVARA_GRANTHAM_OVERRIDES_KEY,
  writeSvaraGranthamOverrides
} from '../../infra/storage/svara-grantham-overrides';
import type { StorageLike } from '../../domain/shared/types';

class MemoryStorage implements StorageLike {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('svara grantham overrides storage', () => {
  it('reads and writes browser-local override maps', () => {
    const storage = new MemoryStorage();

    const saved = writeSvaraGranthamOverrides(
      {
        'endaro-mahanubhavulu': 'Edited notation'
      },
      storage
    );

    expect(saved).toBe(true);
    expect(storage.getItem(SVARA_GRANTHAM_OVERRIDES_KEY)).toContain('Edited notation');
    expect(readSvaraGranthamOverrides(storage)).toEqual({
      'endaro-mahanubhavulu': 'Edited notation'
    });
  });

  it('falls back safely on malformed persisted data', () => {
    const storage = new MemoryStorage();
    storage.setItem(SVARA_GRANTHAM_OVERRIDES_KEY, '{broken json');

    expect(readSvaraGranthamOverrides(storage)).toEqual({});
  });

  it('reports failed persistence when storage is unavailable', () => {
    expect(writeSvaraGranthamOverrides({ demo: 'value' }, null)).toBe(false);
    expect(readSvaraGranthamOverrides(null)).toEqual({});
  });
});
