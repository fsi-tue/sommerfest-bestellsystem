import { CONSTANTS } from "@/config";
import dbConnect from "@/lib/dbConnect";
import { Session } from "@/model/session";

import crypto from 'crypto';
import { addHours } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    await dbConnect()

    const { token } = await request.json();
    if (!token) {
        return NextResponse.json({
            message: 'Token not set'
        }, { status: 500 });
    }

    try {
        // Validate token
        const correct_token = process.env.PAYMENT_ADMIN_TOKEN;
        if (!correct_token || correct_token.length === 0) {
            return NextResponse.json({
                message: 'Token not set'
            }, { status: 500 });
        }

        if (token === correct_token) {
            const sessionToken = crypto.randomBytes(64).toString('hex');
            const expiresAt = addHours(new Date(), CONSTANTS.LIFETIME_BEARER_HOURS);

            // Save session to database
            const session = new Session();
            session.userId = 'admin';
            session.token = sessionToken;
            session.expiresAt = expiresAt;
            await session.save();
            console.log('New token created', sessionToken, session.expiresAt.toISOString());

            const cookieStore = await cookies();
            cookieStore.set('auth-token', sessionToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: CONSTANTS.LIFETIME_BEARER_HOURS * 60 * 60, // Use your constant
                path: '/'
            });

            return NextResponse.json({
                success: true,
                message: 'Authentication successful'
            });
        } else {
            return NextResponse.json({
                message: 'Invalid token'
            }, { status: 401 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: 'Error creating token'
        }, { status: 500 });
    }
}
