'use client';

import { useEffect } from 'react';

/**
 * Initializes guest ID cookie using browser fingerprinting
 * This runs as early as possible in the React tree
 */
export function GuestIdInitializer() {
  useEffect(() => {
    // Check if cookie already exists
    const getCookie = (name: string) => {
      const value = '; ' + document.cookie;
      const parts = value.split('; ' + name + '=');
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const existingCookie = getCookie('guestId');
    if (existingCookie) {
      console.log('[GuestIdInitializer] Cookie already exists:', existingCookie);
      return;
    }

    // Generate browser fingerprint
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    const canvasData = canvas.toDataURL();

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      colorDepth: screen.colorDepth,
      screenResolution: screen.width + 'x' + screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      canvas: canvasData.substring(0, 100),
    };

    const fingerprintString = JSON.stringify(fingerprint);
    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
      const char = fingerprintString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    const guestId = 'guest_' + Math.abs(hash).toString(36);
    document.cookie = `guestId=${guestId}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    console.log('[GuestIdInitializer] Set guestId cookie:', guestId);
  }, []);

  return null; // This component doesn't render anything
}
