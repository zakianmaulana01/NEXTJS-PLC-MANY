'use client';

import type { SavedLayout } from '@/types/editor';
import { LAYOUT_STORAGE_KEY } from '@/types/editor';

/**
 * Shared hook for reading persisted layout data.
 * Used by both the editor page (to load existing layout) and
 * the monitoring page (to render the custom layout).
 */
export function useLayoutPersistence() {
  const getSavedLayout = (): SavedLayout | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SavedLayout;
    } catch {
      return null;
    }
  };

  const hasCustomLayout = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(LAYOUT_STORAGE_KEY) !== null;
  };

  const clearLayout = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
  };

  return { getSavedLayout, hasCustomLayout, clearLayout };
}
