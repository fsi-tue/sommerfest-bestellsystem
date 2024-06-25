import { constants, tokens } from "@/config";
import dbConnect from "@/lib/dbConnect";
import { Session } from "@/model/session";
import { rateLimit } from "@/lib/rateLimit";

const moment = require('moment-timezone');
const crypto = require('crypto');

const rateLimiter = rateLimit(5, 15 * 60 * 1000);

export async function POST(req: Request, res: Response, next: () => void): Promise<Response> {
    await dbConnect()

    const { token } = await req.json();
    if (!token) {
        return new Response('Token missing', { status: 400 });
    }
    const bearer = { token: '', expires: 0 };

    try {
        // Validate token
        const correct_token: string = process.env.PAYMENT_ADMIN_TOKEN || tokens.PAYMENT_ADMIN_TOKEN;
        if (!correct_token) {
            return new Response('Token not set', { status: 500 });
        }

        if (token === correct_token) {
            const newToken = crypto.randomBytes(64).toString('hex');

            // Add the new token to the database
            const session = new Session();
            session.userId = 'admin';
            session.token = newToken;
            session.expiresAt = moment().add(constants.LIFETIME_BEARER_HOURS, "hours").toDate();
            await session.save();
            console.log('New token created', newToken, session.expiresAt.toISOString());

            // Create a new bearer
            bearer.token = newToken;
            bearer.expires = moment(session.expiresAt).unix();
        } else {
            return new Response('Invalid token', { status: 403 });
        }

        if (bearer.expires > 0) {
            return new Response(JSON.stringify(bearer));
        } else {
            return new Response('Error creating token', { status: 500 });
        }
    } catch (error) {
        console.error(error);
        return new Response('Error creating token', { status: 500 });
    }
}
