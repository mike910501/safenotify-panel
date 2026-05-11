"use client";

import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

const STORAGE_VERSION = 1;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const PERSIST_DEBOUNCE_MS = 300;

interface StoredEntry<T> {
  version: number;
  savedAt: number;
  data: T;
}

export interface UseWizardPersistenceResult<T> {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  clear: () => void;
  hydrated: boolean;
}

export function useWizardPersistence<T>(
  key: string,
  initialValue: T
): UseWizardPersistenceResult<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setHydrated(true);
      return;
    }

    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredEntry<T>;
        const age = Date.now() - parsed.savedAt;
        if (parsed.version === STORAGE_VERSION && age < MAX_AGE_MS) {
          setValue(parsed.data);
        } else {
          window.localStorage.removeItem(key);
        }
      }
    } catch {
      // Corrupt JSON or storage disabled — drop and fall back to initialValue.
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Storage fully unavailable; nothing else to do.
      }
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const timer = setTimeout(() => {
      try {
        const entry: StoredEntry<T> = {
          version: STORAGE_VERSION,
          savedAt: Date.now(),
          data: value,
        };
        window.localStorage.setItem(key, JSON.stringify(entry));
      } catch {
        // Quota exceeded or storage disabled — wizard still works in-memory.
      }
    }, PERSIST_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [key, value, hydrated]);

  const clear = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
    setValue(initialValue);
  }, [key, initialValue]);

  return { value, setValue, clear, hydrated };
}
