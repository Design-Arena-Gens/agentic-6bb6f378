'use client';

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!hydrated) {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setValue(JSON.parse(item) as T);
        }
      } catch (error) {
        console.error("Failed to read from localStorage", error);
      } finally {
        setHydrated(true);
      }
    }
  }, [hydrated, key]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to write to localStorage", error);
    }
  }, [hydrated, key, value]);

  return [value, setValue, hydrated] as const;
}
