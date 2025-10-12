'use client';

import { getGuestIdFromFingerprint } from './fingerprint';

/**
 * Wrapper around fetch that automatically adds the guest fingerprint header
 * Use this instead of raw fetch() calls to ensure guest identification works correctly
 */
export async function fetchWithFingerprint(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);

  // Add fingerprint-based guest ID to all requests
  if (typeof window !== 'undefined') {
    try {
      const guestId = getGuestIdFromFingerprint();
      if (guestId) {
        headers.set('x-guest-fingerprint', guestId);
      }
    } catch (e) {
      console.warn('Failed to generate guest fingerprint:', e);
    }
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
