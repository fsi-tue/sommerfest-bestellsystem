const moment = require('moment-timezone');
const crypto = require('crypto');

export async function POST(req: Request) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return new Response('Authorization header missing', { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return new Response('Token missing', { status: 400 });
    }

    // Retrieve the token list from the app context
    const tokenlist = req.app.get("tokenlist") || [];
    const tokenEntry = tokenlist.find((entry: any) => entry.token === token);

    if (!tokenEntry) {
        return new Response('Invalid token', { status: 403 });
    }

    // Check if the token has expired
    if (moment().isAfter(tokenEntry.expiresAt)) {
        return new Response('Token expired', { status: 403 });
    }
}

/**
 * Rate limiter for login requests
 */
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 login requests per windowMs
    message: "Too many login attempts from this IP, please try again after 15 minutes",
    validate: false,
});
