import type { StorageLike } from '../../domain/shared/types';

export function getSessionStorage(): StorageLike | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }

  return sessionStorage;
}

export function readSessionState<T>(key: string, fallback: T, storage: StorageLike | null = getSessionStorage()): T {
  if (!storage) {
    return fallback;
  }

  const raw = storage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeSessionState<T>(key: string, value: T, storage: StorageLike | null = getSessionStorage()): void {
  if (!storage) {
    return;
  }

  storage.setItem(key, JSON.stringify(value));
}
