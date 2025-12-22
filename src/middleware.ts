import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    // Define public paths (Login, Public Assets, Favicon, Next.js internals)
    const isPublicPath =
        pathname === '/login' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('favicon.ico');

    // If user is logged in and visits login page, redirect to home
    if (isPublicPath && token && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // If user is NOT logged in and visits protected page, redirect to login
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

// Optimization: Matcher to skip static files entirely
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
