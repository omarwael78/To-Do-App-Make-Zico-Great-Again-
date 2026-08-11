import { useState, useEffect, useRef } from 'react';

type Initializer<T> = T | (() => T);

function resolve<T>(value: Initializer<T>): T {
  return typeof value === 'function' ? (value as () => T)() : value;
}

/**
 * State that automatically persists to localStorage.
 * - Reads once on mount (lazy, so heavy initializers run only when needed).
 * - Writes on every change.
 * - Keeps multiple open tabs in sync via the `storage` event.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: Initializer<T>
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : resolve(initialValue);
    } catch {
      return resolve(initialValue);
    }
  });

  // Skip the very first write so we never clobber stored data on mount.
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      // Ensure the key exists so first-run seeding is recorded.
      if (localStorage.getItem(key) === null) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {
          /* storage unavailable */
        }
      }
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota exceeded or private mode */
    }
  }, [key, value]);

  // Cross-tab synchronisation
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        setValue(JSON.parse(e.newValue) as T);
      } catch {
        /* ignore malformed payloads */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [value, setValue];
}
