import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/otp-verification',
  '/',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/images')
  );
  const isApiRoute = pathname.startsWith('/api');

  if (isPublicPath) {
    return NextResponse.next();
  }

  if (isApiRoute && !refreshToken) {
    const isAuthApi = pathname.startsWith('/api/auth/login') ||
      pathname.startsWith('/api/auth/register') ||
      pathname.startsWith('/api/auth/forgot-password') ||
      pathname.startsWith('/api/auth/reset-password') ||
      pathname.startsWith('/api/auth/verify-otp') ||
      pathname.startsWith('/api/auth/resend-otp') ||
      pathname.startsWith('/api/auth/verify-email') ||
      pathname.startsWith('/api/auth/resend-verification') ||
      pathname.startsWith('/api/auth/refresh-token') ||
      pathname.startsWith('/api/csrf-token') ||
      pathname.startsWith('/api/health');
    if (!isAuthApi) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};