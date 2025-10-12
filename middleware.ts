import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Clone the request headers
    const requestHeaders = new Headers(req.headers);

    // Create response
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Add cache-control headers to prevent caching for guest user data
    if (req.nextUrl.pathname.startsWith('/boards') ||
        req.nextUrl.pathname.startsWith('/api/boards')) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }

    return response;
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
