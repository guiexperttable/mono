// In-memory implementation of the Web Storage API (localStorage) for unit tests in Node.
//
//   const storage = memoryStorage({ 'tablescrollState': '[10,20]' });
//   vi.stubGlobal('localStorage', storage);
//
// Lives outside src/ on purpose: it must not end up in the npm package.

export function memoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, String(value));
    },
  };
}

/** A storage whose every access throws – like Safari private mode, a full quota or a sandboxed iframe. */
export function throwingStorage(): Storage {
  const fail = () => {
    throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
  };
  return {
    get length() {
      return 0;
    },
    clear: fail,
    getItem: fail,
    key: fail,
    removeItem: fail,
    setItem: fail,
  };
}
