import type { StorageLike } from '../../domain/shared/types';

export const SVARA_GRANTHAM_OVERRIDES_KEY = 'paadugajala:svara-grantham:overrides:v1';

export function getLocalStorageState(): StorageLike | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage;
}

export function readSvaraGranthamOverrides(
  storage: StorageLike | null = getLocalStorageState()
): Record<string, string> {
  if (!storage) {
    return {};
  }

  const raw = storage.getItem(SVARA_GRANTHAM_OVERRIDES_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<Record<string, string>>((accumulator, [key, value]) => {
      if (typeof value === 'string') {
        accumulator[key] = value;
      }

      return accumulator;
    }, {});
  } catch {
    return {};
  }
}

export function writeSvaraGranthamOverrides(
  overrides: Record<string, string>,
  storage: StorageLike | null = getLocalStorageState()
): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(SVARA_GRANTHAM_OVERRIDES_KEY, JSON.stringify(overrides));
    return true;
  } catch {
    return false;
  }
}
