import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Clone the request headers
    const requestHeaders = new Headers(req.headers);

    // Ensure guest fingerprint header is preserved
    const guestFingerprint = req.headers.get('x-guest-fingerprint');
    if (guestFingerprint) {
      console.log('[Middleware] Forwarding guest fingerprint:', guestFingerprint);
      requestHeaders.set('x-guest-fingerprint', guestFingerprint);
    }

    // Create response with modified request headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access if user has a valid token (includes both regular users and guests)
        return !!token;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: [
    // Protected page routes (only protect authenticated-only features)
    "/dashboard/:path*",
    "/settings/:path*",
    "/activity/:path*",

    // Note: /boards and /scrum allow guest access, so they're not protected here
    // Guest users can access these routes and use guest-specific features

    // Protected API routes (authentication endpoints only)
    "/api/auth/change-password",
  ],
};
