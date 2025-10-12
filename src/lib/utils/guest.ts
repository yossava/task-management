import { cookies, headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUserId } from './session';

/**
 * SIMPLIFIED: Get or create a guest ID
 * Just check cookie, if not exist generate UUID and set HttpOnly cookie
 * Server manages everything - no client-side complexity
 */
export async function getOrCreateGuestId(): Promise<string> {
  const cookieStore = await cookies();

  // Check existing cookie
  const existingCookie = cookieStore.get('guestId')?.value;

  if (existingCookie) {
    console.log('[getOrCreateGuestId] Using existing cookie:', existingCookie);
    return existingCookie;
  }

  // Generate new UUID (use full UUID format for better uniqueness)
  const newGuestId = uuidv4();
  console.log('[getOrCreateGuestId] Generated new guest ID:', newGuestId);

  // Set HttpOnly cookie (server-managed, more secure)
  cookieStore.set('guestId', newGuestId, {
    httpOnly: true, // Server-only, can't be accessed by JavaScript
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    sameSite: 'lax',
  });

  console.log('[getOrCreateGuestId] Cookie set, returning:', newGuestId);
  return newGuestId;
}

export async function getGuestId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('guestId')?.value;
}

export async function clearGuestId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('guestId');
}

export async function isGuestUser(): Promise<boolean> {
  const userId = await getCurrentUserId();
  return !userId;
}

export const GUEST_LIMITS = {
  MAX_BOARDS: 2,
  MAX_TASKS_PER_BOARD: 20,
} as const;
