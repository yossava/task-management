import { Session } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

/**
 * Get user identity (userId or guestId) from session
 */
export async function getUserIdentity(session: Session | null): Promise<{
  userId: string | null;
  guestId: string | null;
  isGuest: boolean;
}> {
  if (session?.user?.email) {
    // Registered user
    return {
      userId: session.user.id || null,
      guestId: null,
      isGuest: false,
    };
  }

  // Guest user - get or create guest ID from cookie
  const cookieStore = await cookies();
  let guestId = cookieStore.get('guest-id')?.value;

  if (!guestId) {
    guestId = uuidv4();
    // Note: Setting cookie here won't work in API routes
    // The cookie should be set by middleware or client-side
  }

  return {
    userId: null,
    guestId,
    isGuest: true,
  };
}
