import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Initialize the rate limiter
const rateLimiter = new RateLimiterMemory({
    points: 10, // Number of points
    duration: 1, // Per second
});

export async function middleware(request: NextRequest) {
    try {
        // Consume a point for each request
        await rateLimiter.consume(request.ip);

        // If successful, proceed with the request
        return NextResponse.next();
    } catch (rateLimiterRes) {
        // If rate limit is exceeded, send a 429 response
        return new NextResponse('Too many requests', { status: 429 });
    }
}

// Specify the paths that will use this middleware
export const config = {
    matcher: '/api/auth/login/',
};
