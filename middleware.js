import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('auth-token')?.value;
    const { pathname } = request.nextUrl;

    // Public routes (no authentication needed)
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // API routes that are public
    const publicApiRoutes = ['/api/login', '/api/register'];
    const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));

    // Allow access to static files and public routes
    if (isPublicRoute || isPublicApi || pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // Protected routes - require authentication
    if (!token && !isPublicRoute) {
        // Redirect to login page
        const url = new URL('/login', request.url);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};