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
  }
);

export const config = {
  matcher: [
    // Protected page routes
    "/dashboard/:path*",
    "/boards/:path*",
    "/scrum/:path*",
    "/settings/:path*",
    "/activity/:path*",

    // Protected API routes
    "/api/boards/:path*",
    "/api/scrum/:path*",
    "/api/tasks/:path*",
    "/api/settings/:path*",
    "/api/auth/change-password",
  ],
};
