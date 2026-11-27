import { useState, useEffect, useCallback, useRef } from 'react';

export interface PlannerStorageEnvelope<T> {
  version: number;
  updatedAt: string;
  data: T;
}

export interface LoadedPlannerStorage<T> {
  value: T;
  restoredFromStorage: boolean;
  recoveredFromCorruption: boolean;
  updatedAt: string | null;
}

function getSafeLocalStorage(): Storage | null {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function loadPlannerStorage<T>(
  storageKey: string,
  version: number,
  defaultValue: T,
  sanitize?: (raw: unknown) => T | null
): LoadedPlannerStorage<T> {
  const storage = getSafeLocalStorage();
  if (!storage) {
    return {
      value: defaultValue,
      restoredFromStorage: false,
      recoveredFromCorruption: false,
      updatedAt: null
    };
  }

  let rawText: string | null = null;
  try {
    rawText = storage.getItem(storageKey);
  } catch {
    return {
      value: defaultValue,
      restoredFromStorage: false,
      recoveredFromCorruption: false,
      updatedAt: null
    };
  }

  if (rawText === null || rawText.trim() === '') {
    return {
      value: defaultValue,
      restoredFromStorage: false,
      recoveredFromCorruption: false,
      updatedAt: null
    };
  }

  try {
    const parsed: unknown = JSON.parse(rawText);
    if (!parsed || typeof parsed !== 'object') {
      return {
        value: defaultValue,
        restoredFromStorage: false,
        recoveredFromCorruption: true,
        updatedAt: null
      };
    }

    const envelope = parsed as Partial<PlannerStorageEnvelope<unknown>>;
    const candidatePayload =
      typeof envelope.version === 'number' && 'data' in envelope
        ? envelope.version === version
          ? envelope.data
          : null
        : null;

    if (candidatePayload === null) {
      return {
        value: defaultValue,
        restoredFromStorage: false,
        recoveredFromCorruption: true,
        updatedAt: null
      };
    }

    if (sanitize) {
      const sanitized = sanitize(candidatePayload);
      if (sanitized === null) {
        return {
          value: defaultValue,
          restoredFromStorage: false,
          recoveredFromCorruption: true,
          updatedAt: null
        };
      }
      return {
        value: sanitized,
        restoredFromStorage: true,
        recoveredFromCorruption: false,
        updatedAt: typeof envelope.updatedAt === 'string' ? envelope.updatedAt : null
      };
    }

    return {
      value: candidatePayload as T,
      restoredFromStorage: true,
      recoveredFromCorruption: false,
      updatedAt: typeof envelope.updatedAt === 'string' ? envelope.updatedAt : null
    };
  } catch {
    return {
      value: defaultValue,
      restoredFromStorage: false,
      recoveredFromCorruption: true,
      updatedAt: null
    };
  }
}

export function savePlannerStorage<T>(
  storageKey: string,
  version: number,
  data: T
): { ok: boolean; updatedAt: string | null } {
  const storage = getSafeLocalStorage();
  if (!storage) return { ok: false, updatedAt: null };
  const updatedAt = new Date().toISOString();
  const envelope: PlannerStorageEnvelope<T> = {
    version,
    updatedAt,
    data
  };
  try {
    storage.setItem(storageKey, JSON.stringify(envelope));
    return { ok: true, updatedAt };
  } catch {
    return { ok: false, updatedAt: null };
  }
}

export function clearPlannerStorage(storageKey: string): void {
  const storage = getSafeLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(storageKey);
  } catch {
    // Ignore storage removal errors in restricted contexts
  }
}

export interface UsePlannerStorageOptions<T> {
  storageKey: string;
  version: number;
  defaultValue: T;
  sanitize?: (raw: unknown) => T | null;
}

export function usePlannerStorage<T>({
  storageKey,
  version,
  defaultValue,
  sanitize
}: UsePlannerStorageOptions<T>) {
  const initialRef = useRef<LoadedPlannerStorage<T> | null>(null);
  if (initialRef.current === null) {
    initialRef.current = loadPlannerStorage(storageKey, version, defaultValue, sanitize);
  }

  const [state, setState] = useState<T>(initialRef.current.value);
  const [recoveredFromCorruption, setRecoveredFromCorruption] = useState<boolean>(
    initialRef.current.recoveredFromCorruption
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialRef.current.updatedAt);
  const [hasSavedData, setHasSavedData] = useState<boolean>(
    initialRef.current.restoredFromStorage
  );
  const skipNextAutoSaveRef = useRef<boolean>(false);

  // Re-load if storageKey changes (e.g., mode switch on shared component)
  const prevKeyRef = useRef<string>(storageKey);
  useEffect(() => {
    if (prevKeyRef.current !== storageKey) {
      prevKeyRef.current = storageKey;
      const loaded = loadPlannerStorage(storageKey, version, defaultValue, sanitize);
      skipNextAutoSaveRef.current = true;
      setState(loaded.value);
      setRecoveredFromCorruption(loaded.recoveredFromCorruption);
      setLastSavedAt(loaded.updatedAt);
      setHasSavedData(loaded.restoredFromStorage);
    }
  }, [storageKey, version, defaultValue, sanitize]);

  // Auto-persist subsequent changes cleanly
  const isFirstMountRef = useRef<boolean>(true);
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }
    const res = savePlannerStorage(storageKey, version, state);
    if (res.ok) {
      setLastSavedAt(res.updatedAt);
      setHasSavedData(true);
    }
  }, [state, storageKey, version]);

  const resetToDefault = useCallback(() => {
    clearPlannerStorage(storageKey);
    skipNextAutoSaveRef.current = true;
    setState(defaultValue);
    setLastSavedAt(null);
    setHasSavedData(false);
    setRecoveredFromCorruption(false);
  }, [storageKey, defaultValue]);

  const clearWithState = useCallback(
    (emptyValue: T) => {
      clearPlannerStorage(storageKey);
      skipNextAutoSaveRef.current = true;
      setState(emptyValue);
      setLastSavedAt(null);
      setHasSavedData(false);
      setRecoveredFromCorruption(false);
    },
    [storageKey]
  );

  const dismissCorruptionNotice = useCallback(() => {
    setRecoveredFromCorruption(false);
  }, []);

  return {
    state,
    setState,
    resetToDefault,
    clearWithState,
    hasSavedData,
    lastSavedAt,
    recoveredFromCorruption,
    dismissCorruptionNotice
  };
}
