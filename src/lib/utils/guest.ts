import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUserId } from './session';

export async function getOrCreateGuestId(): Promise<string> {
  const cookieStore = await cookies();
  let guestId = cookieStore.get('guestId')?.value;

  if (!guestId) {
    guestId = uuidv4();
    cookieStore.set('guestId', guestId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });
  }

  return guestId;
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
