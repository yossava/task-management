import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST /api/auth/clear-guest - Clear guest ID cookie after login/registration
export async function POST() {
  try {
    const cookieStore = await cookies();

    // Delete the guest ID cookie
    cookieStore.delete('guestId');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing guest cookie:', error);
    return NextResponse.json(
      { error: 'Failed to clear guest cookie' },
      { status: 500 }
    );
  }
}
