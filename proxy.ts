import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_KEY = 'makromedia_auth_token';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/projects',
  '/application-cost',
  '/manpower',
  '/clients',
  '/profile',
  '/quotations',
  '/invoices',
  '/production-cost',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_KEY)?.value;

  const isAuthPage = pathname === '/login' || pathname.startsWith('/(auth)');
  const isProtectedPage = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!token && isProtectedPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
