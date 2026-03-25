export function createId(prefix: string = 'pg'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
