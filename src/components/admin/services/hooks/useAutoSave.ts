'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { z } from 'zod';

interface AutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error' | 'invalid';
  lastSaved: Date | null;
  error: string | null;
  validationErrors: string[] | null;
}

interface DraftInfo<T> {
  data: T;
  savedAt: Date;
}

interface UseAutoSaveOptions<T> {
  interval?: number; // ms, default 30000 (30 seconds)
  onSave?: () => void;
  onRestore?: () => void;
  enabled?: boolean;
  schema?: z.ZodSchema<T>; // Zod schema for validation before save
  initialData?: T; // Initial data to compare against (avoids saving unchanged data)
}

interface UseAutoSaveReturn<T> {
  state: AutoSaveState;
  save: () => void;
  restore: () => T | null;
  clear: () => void;
  getDraftInfo: () => DraftInfo<T> | null;
  hasMeaningfulDraft: (currentData: T, newerThan?: Date | string) => boolean;
  timeSinceLastSave: string | null;
  isStorageAvailable: boolean;
}

const STORAGE_PREFIX = 'service-draft-';

/**
 * Check if localStorage is available and has space
 */
function checkStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deep equality check for detecting actual changes
 */
function hasDataChanged<T>(prev: T | null, current: T): boolean {
  if (prev === null) return true;
  return JSON.stringify(prev) !== JSON.stringify(current);
}

/**
 * Hook for auto-saving form data to localStorage with validation
 * @param formId - Unique identifier for the form (e.g., 'new' or serviceId)
 * @param data - The form data to save
 * @param options - Configuration options including optional Zod schema
 */
export function useAutoSave<T>(
  formId: string,
  data: T,
  options: UseAutoSaveOptions<T> = {}
): UseAutoSaveReturn<T> {
  const {
    interval = 30000,
    onSave,
    onRestore,
    enabled = true,
    schema,
    initialData,
  } = options;

  const storageKey = `${STORAGE_PREFIX}${formId}`;

  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
    error: null,
    validationErrors: null,
  });

  const [isStorageAvailable] = useState(() => checkStorageAvailable());
  const [timeSinceLastSave, setTimeSinceLastSave] = useState<string | null>(null);

  const dataRef = useRef(data);
  // Initialize with initialData to avoid saving unchanged data on first interval
  const lastSavedDataRef = useRef<T | null>(initialData ?? null);
  const initialDataRef = useRef<T | null>(initialData ?? null);

  // Update ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  /**
   * Get draft info without restoring (for comparison)
   */
  const getDraftInfo = useCallback((): DraftInfo<T> | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // Validate if schema provided
      if (schema) {
        const result = schema.safeParse(parsed.data);
        if (!result.success) {
          // Invalid draft - clean it up
          localStorage.removeItem(storageKey);
          return null;
        }
      }

      return {
        data: parsed.data as T,
        savedAt: new Date(parsed.savedAt),
      };
    } catch {
      return null;
    }
  }, [storageKey, schema]);

  /**
   * Check if there's a meaningful draft worth restoring
   * - Draft must exist and be valid
   * - Draft must be different from currentData
   * - If newerThan provided, draft must be newer than that date
   */
  const hasMeaningfulDraft = useCallback((currentData: T, newerThan?: Date | string): boolean => {
    const draft = getDraftInfo();
    if (!draft) return false;

    // Check if draft is different from current data
    const isDifferent = hasDataChanged(currentData, draft.data);
    if (!isDifferent) return false;

    // Check if draft is newer than the reference date (e.g., service.updatedAt)
    if (newerThan) {
      const referenceDate = newerThan instanceof Date ? newerThan : new Date(newerThan);
      // Draft must be at least 1 second newer to be considered meaningful
      if (draft.savedAt.getTime() <= referenceDate.getTime() + 1000) {
        return false;
      }
    }

    return true;
  }, [getDraftInfo]);

  // Save function with validation and change detection
  const save = useCallback(() => {
    if (typeof window === 'undefined' || !enabled || !isStorageAvailable) return;

    const currentData = dataRef.current;

    // Skip if data hasn't changed since last save
    if (!hasDataChanged(lastSavedDataRef.current, currentData)) {
      return;
    }

    // Also skip if data is identical to initial data (nothing was modified)
    if (initialDataRef.current && !hasDataChanged(initialDataRef.current, currentData)) {
      return;
    }

    setState((prev) => ({ ...prev, status: 'saving' }));

    // Validate with Zod schema if provided
    if (schema) {
      const result = schema.safeParse(currentData);
      if (!result.success) {
        const errors = result.error.errors.map(e => e.message);
        setState({
          status: 'invalid',
          lastSaved: state.lastSaved,
          error: 'Données invalides - brouillon non sauvegardé',
          validationErrors: errors,
        });
        return;
      }
    }

    try {
      const dataToSave = {
        data: currentData,
        savedAt: new Date().toISOString(),
        version: 1,
      };
      const serialized = JSON.stringify(dataToSave);

      // Check estimated size before saving (localStorage limit is ~5MB)
      const estimatedSize = new Blob([serialized]).size;
      if (estimatedSize > 4 * 1024 * 1024) {
        setState({
          status: 'error',
          lastSaved: state.lastSaved,
          error: 'Brouillon trop volumineux pour être sauvegardé',
          validationErrors: null,
        });
        return;
      }

      localStorage.setItem(storageKey, serialized);
      lastSavedDataRef.current = currentData;

      setState({
        status: 'saved',
        lastSaved: new Date(),
        error: null,
        validationErrors: null,
      });
      onSave?.();
    } catch (error) {
      const isQuotaError = error instanceof DOMException &&
        (error.code === 22 || error.name === 'QuotaExceededError');

      setState({
        status: 'error',
        lastSaved: state.lastSaved,
        error: isQuotaError
          ? 'Stockage local plein - impossible de sauvegarder le brouillon'
          : (error instanceof Error ? error.message : 'Erreur de sauvegarde'),
        validationErrors: null,
      });
    }
  }, [storageKey, enabled, onSave, state.lastSaved, schema, isStorageAvailable]);

  // Restore function with validation
  const restore = useCallback((): T | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const restoredData = parsed.data as T;

      if (schema) {
        const result = schema.safeParse(restoredData);
        if (!result.success) {
          console.warn('Draft data invalid, clearing:', result.error.errors);
          localStorage.removeItem(storageKey);
          return null;
        }
      }

      lastSavedDataRef.current = restoredData;
      onRestore?.();
      return restoredData;
    } catch {
      localStorage.removeItem(storageKey);
      return null;
    }
  }, [storageKey, onRestore, schema]);

  // Clear function
  const clear = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(storageKey);
      lastSavedDataRef.current = initialDataRef.current;
      setState({
        status: 'idle',
        lastSaved: null,
        error: null,
        validationErrors: null,
      });
    } catch {
      // Ignore errors
    }
  }, [storageKey]);

  // Auto-save interval
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const intervalId = setInterval(() => {
      save();
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, save]);

  // Update time since last save
  useEffect(() => {
    if (!state.lastSaved) return;

    const updateTime = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - state.lastSaved!.getTime()) / 1000);

      if (diff < 5) {
        setTimeSinceLastSave("à l'instant");
      } else if (diff < 60) {
        setTimeSinceLastSave(`il y a ${diff} sec`);
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        setTimeSinceLastSave(`il y a ${minutes} min`);
      } else {
        const hours = Math.floor(diff / 3600);
        setTimeSinceLastSave(`il y a ${hours}h`);
      }
    };

    updateTime();
    const timerId = setInterval(updateTime, 10000);

    return () => clearInterval(timerId);
  }, [state.lastSaved]);

  return {
    state,
    save,
    restore,
    clear,
    getDraftInfo,
    hasMeaningfulDraft,
    timeSinceLastSave: state.lastSaved ? timeSinceLastSave : null,
    isStorageAvailable,
  };
}

/**
 * Format the auto-save status for display
 */
export function formatAutoSaveStatus(state: AutoSaveState, timeSince: string | null): string {
  switch (state.status) {
    case 'saving':
      return 'Sauvegarde...';
    case 'saved':
      return timeSince ? `Brouillon ${timeSince}` : 'Brouillon sauvegardé';
    case 'invalid':
      return 'Formulaire incomplet';
    case 'error':
      return state.error || 'Erreur de sauvegarde';
    default:
      return '';
  }
}

/**
 * Get badge variant based on auto-save status
 */
export function getAutoSaveBadgeVariant(status: AutoSaveState['status']): 'outline' | 'destructive' | 'secondary' {
  switch (status) {
    case 'error':
      return 'destructive';
    case 'invalid':
      return 'secondary';
    default:
      return 'outline';
  }
}
