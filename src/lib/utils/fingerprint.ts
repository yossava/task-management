'use client';

/**
 * Generate a stable browser fingerprint based on device characteristics
 * This creates a more persistent identifier than cookies
 */
export function generateFingerprint(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const components: string[] = [];

  // Screen properties
  components.push(`screen:${screen.width}x${screen.height}x${screen.colorDepth}`);

  // Timezone
  components.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

  // Language
  components.push(`lang:${navigator.language}`);

  // Platform
  components.push(`platform:${navigator.platform}`);

  // Hardware concurrency (CPU cores)
  components.push(`cores:${navigator.hardwareConcurrency || 'unknown'}`);

  // Device memory (if available)
  if ('deviceMemory' in navigator) {
    components.push(`memory:${(navigator as any).deviceMemory}`);
  }

  // User agent (browser info)
  components.push(`ua:${navigator.userAgent}`);

  // Canvas fingerprint (more advanced)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Browser Fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Browser Fingerprint', 4, 17);
      const canvasData = canvas.toDataURL();
      components.push(`canvas:${hashString(canvasData)}`);
    }
  } catch (e) {
    // Canvas fingerprinting failed, skip
  }

  // Combine all components and hash them
  const fingerprint = components.join('|');
  return hashString(fingerprint);
}

/**
 * Simple hash function to convert fingerprint components to a short hash
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get or create a persistent guest ID based on browser fingerprint
 * Falls back to localStorage if available
 */
export function getGuestIdFromFingerprint(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const STORAGE_KEY = 'guest_fingerprint_id';

  // Try to get existing ID from localStorage first
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      console.log('[Fingerprint] Using stored ID:', stored);
      return stored;
    }
  } catch (e) {
    console.log('[Fingerprint] localStorage not available:', e);
  }

  // Generate fingerprint-based ID
  const fingerprint = generateFingerprint();
  console.log('[Fingerprint] Generated fingerprint hash:', fingerprint);

  // Use a fixed salt instead of timestamp to maintain consistency across sessions
  // The fingerprint alone provides uniqueness, timestamp would break consistency
  const guestId = `guest_${fingerprint}_${hashString('stable-salt')}`;
  console.log('[Fingerprint] Created guest ID:', guestId);

  // Try to store it for next time
  try {
    localStorage.setItem(STORAGE_KEY, guestId);
    console.log('[Fingerprint] Stored in localStorage');
  } catch (e) {
    console.log('[Fingerprint] Failed to store in localStorage:', e);
  }

  return guestId;
}

/**
 * Clear the stored guest ID (useful for testing)
 */
export function clearGuestFingerprint(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('guest_fingerprint_id');
  } catch (e) {
    // localStorage not available
  }
}
