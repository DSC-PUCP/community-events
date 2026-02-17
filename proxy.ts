import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth';

export const runtime = 'nodejs';

export async function proxy(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    const isAuthPage = request.nextUrl.pathname.startsWith('/login');
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
    const isChangePasswordPage = request.nextUrl.pathname.startsWith('/change-password');

    if (isAuthPage && session?.user) {
        return NextResponse.redirect(new URL('/community-events/dashboard', request.url));
    }

    if (isProtectedRoute && !session?.user) {
        return NextResponse.redirect(new URL('/community-events/login', request.url));
    }

    if (session?.user?.isFirstLogin && !isChangePasswordPage) {
        return NextResponse.redirect(new URL('/community-events/change-password', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/change-password'],
};