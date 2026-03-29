export function onVisibilityChange(callback: (hidden: boolean) => void): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const handler = () => callback(document.hidden);
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}

export function onWindowBlur(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('blur', callback);
  return () => window.removeEventListener('blur', callback);
}
