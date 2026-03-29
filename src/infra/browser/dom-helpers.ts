export function queryRequired<T extends Element>(selector: string, scope: ParentNode = document): T {
  const match = scope.querySelector<T>(selector);
  if (!match) {
    throw new Error(`Missing DOM element for selector: ${selector}`);
  }
  return match;
}

export function addWindowListener<K extends keyof WindowEventMap>(type: K, listener: (event: WindowEventMap[K]) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const wrapped = listener as EventListener;
  window.addEventListener(type, wrapped);
  return () => window.removeEventListener(type, wrapped);
}
