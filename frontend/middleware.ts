import { NextRequest, NextResponse } from 'next/server';

// Simple gate: if accessing protected area and no access token in session cookie header, allow but frontend will refresh.
// Real-world: implement server-side access token validation or refresh trigger.

export function middleware(req: NextRequest) {
  // Example protected prefix
  const protectedPaths = ['/dashboard', '/videos', '/programs'];
  const { pathname } = req.nextUrl;
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    // Could check for a non-httpOnly cookie marker if chosen; here we just pass through
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/videos/:path*', '/programs/:path*'],
};

