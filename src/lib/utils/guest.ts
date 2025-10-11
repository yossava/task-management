import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export function getOrCreateGuestId(): string {
  const cookieStore = cookies();
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

export function getGuestId(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get('guestId')?.value;
}

export function clearGuestId(): void {
  const cookieStore = cookies();
  cookieStore.delete('guestId');
}
