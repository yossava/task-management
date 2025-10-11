import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow the request to proceed if authenticated
    return NextResponse.next();
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
