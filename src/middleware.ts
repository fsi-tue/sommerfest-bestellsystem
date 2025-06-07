// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

// Supported languages
const locales = ['en', 'de', 'fr', 'it'] // Added Italian since you mentioned speaking it
const defaultLocale = 'en'

function getLocale(request: NextRequest): string {
    // Check if there's a locale in the pathname
    const pathname = request.nextUrl.pathname
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) {
        return pathname.split('/')[1]
    }

    // Check Accept-Language header
    const acceptLanguage = request.headers.get('Accept-Language')
    if (acceptLanguage) {
        const preferredLocale = acceptLanguage
            .split(',')
            .map(lang => lang.split(';')[0].trim())
            .find(lang => locales.includes(lang.split('-')[0]))

        if (preferredLocale) {
            return preferredLocale.split('-')[0]
        }
    }

    return defaultLocale
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Skip middleware for static files and API routes
    if (
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/api/') ||
        pathname.includes('.') // Static files
    ) {
        return NextResponse.next()
    }

    // Check if pathname already has a locale
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (!pathnameHasLocale) {
        // Redirect to the detected locale
        const locale = getLocale(request)
        const newUrl = new URL(`/${locale}${pathname}`, request.url)
        return NextResponse.redirect(newUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ]
}
