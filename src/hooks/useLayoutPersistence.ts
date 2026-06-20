'use client';

import { useState, useEffect } from 'react';
import type { SavedLayout } from '@/types/editor';

/**
 * Shared hook for reading persisted layout data from server.
 * Falls back to localStorage on fetch failure (offline/dev).
 */
export function useLayoutPersistence() {
  const [serverLayout, setServerLayout] = useState<SavedLayout | null | 'loading'>('loading');

  useEffect(() => {
    fetch('/api/layout')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setServerLayout(data))
      .catch(() => setServerLayout(null));
  }, []);

  const getSavedLayout = (): SavedLayout | null => {
    if (serverLayout === 'loading') return null;
    return serverLayout;
  };

  const hasCustomLayout = (): boolean => {
    if (serverLayout === 'loading') return false;
    return serverLayout !== null && Array.isArray((serverLayout as SavedLayout)?.nodes) && (serverLayout as SavedLayout).nodes.length > 0;
  };

  const clearLayout = async () => {
    await fetch('/api/layout', { method: 'DELETE' });
    setServerLayout(null);
  };

  const isLoading = serverLayout === 'loading';

  return { getSavedLayout, hasCustomLayout, clearLayout, isLoading };
}
