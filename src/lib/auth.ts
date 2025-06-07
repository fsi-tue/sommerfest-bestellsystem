import { Session } from "@/model/session";

import dbConnect from "@/lib/dbConnect";

// Cache database connection
let cachedConnection: any = null;

async function getCachedConnection() {
    if (!cachedConnection) {
        cachedConnection = await dbConnect();
    }
    return cachedConnection;
}


// Simple in-memory cache with TTL
const tokenCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedToken(token: string) {
    const cached = tokenCache.get(token);
    if (cached && Date.now() < cached.expiresAt) {
        return cached.isValid;
    }
    tokenCache.delete(token);
    return null;
}

function setCachedToken(token: string, isValid: boolean, dbExpiresAt: Date) {
    const cacheExpiresAt = Math.min(
        Date.now() + CACHE_TTL,
        new Date(dbExpiresAt).getTime()
    );
    tokenCache.set(token, { isValid, expiresAt: cacheExpiresAt });
}


export function extractBearerFromHeaders(headers: Headers): string {
    const authHeader = headers.get('Authorization');
    // Single regex check instead of multiple string operations
    const match = authHeader?.match(/^Bearer\s+(.+)$/);
    return match?.[1] || '';
}

export async function validateToken(token: string): Promise<boolean> {
    // Early validation
    if (!token?.trim()) {
        return false;
    }

    // Check cache first
    const cached = getCachedToken(token);
    if (cached !== null) {
        return cached;
    }

    try {
        await getCachedConnection();

        // Use lean() for faster queries and only select needed fields
        const session = await Session.findOne(
            { token },
            { expiresAt: 1 }
        ).lean().exec();

        if (!session) {
            setCachedToken(token, false, new Date());
            return false;
        }

        // Direct date comparison instead of moment.js
        const isValid = new Date() < new Date(session.expiresAt);
        setCachedToken(token, isValid, session.expiresAt);

        return isValid;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}
