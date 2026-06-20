'use client';

import { useEffect } from 'react';

export default function DisableBackButton() {
  useEffect(() => {
    // Push a dummy state initially to ensure there's a forward state to pop
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // If the user navigates back (e.g. via mouse swipe or browser back button),
      // we immediately push a new state to trap them on the current URL.
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return null;
}
