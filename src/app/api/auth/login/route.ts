import { CONSTANTS } from "@/config";
import dbConnect from "@/lib/dbConnect";
import { Session } from "@/model/session";

import crypto from 'crypto';
import { addHours, getUnixTime } from "date-fns";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<Response> {
    await dbConnect()

    const { token } = await request.json();
    if (!token) {
        return NextResponse.json({
            message: 'Token not set'
        }, { status: 500 });
    }
    const bearer = { token: '', expires: 0 };

    try {
        // Validate token
        const correct_token = process.env.PAYMENT_ADMIN_TOKEN;
        if (!correct_token || correct_token.length === 0) {
            return NextResponse.json({
                message: 'Token not set'
            }, { status: 500 });
        }

        if (token === correct_token) {
            const newToken = crypto.randomBytes(64).toString('hex');

            // Add the new token to the database
            const session = new Session();
            session.userId = 'admin';
            session.token = newToken;
            session.expiresAt = addHours(new Date(), CONSTANTS.LIFETIME_BEARER_HOURS);
            await session.save();
            console.log('New token created', newToken, session.expiresAt.toISOString());

            // Create a new bearer
            bearer.token = newToken;
            bearer.expires = getUnixTime(session.expiresAt);
        } else {
            return NextResponse.json({
                message: 'Invalid token'
            }, { status: 401 });
        }

        if (bearer.expires > 0) {
            return new Response(JSON.stringify(bearer));
        } else {
            return NextResponse.json({
                message: 'Error creating token'
            }, { status: 500 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: 'Error creating token'
        }, { status: 500 });
    }
}
