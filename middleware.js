import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('auth-token')?.value;
    const { pathname } = request.nextUrl;

    // ── 1. Always allow static files and Next.js internals ──
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // ── 2. Always allow ALL /api/ routes ────────────────────
    // Every API route does its own JWT check inside route.js
    // Middleware does NOT need to protect them — it would only
    // cause HTML redirect problems for API clients like Postman
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // ── 3. Public page routes (no authentication needed) ────
    const publicPages = ['/login', '/register', '/'];
    if (publicPages.includes(pathname)) {
        return NextResponse.next();
    }

    // ── 4. All other PAGE routes need authentication ────────
    // If no auth-token cookie → redirect to login page
    if (!token) {
        const url = new URL('/login', request.url);
        return NextResponse.redirect(url);
    }

    // ── 5. User is authenticated, allow access ──────────────
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};