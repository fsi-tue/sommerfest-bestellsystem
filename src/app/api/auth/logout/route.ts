import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import { Session } from "@/model/session";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

/**
 * POST /logout
 * Logout endpoint
 */
export async function POST(req: Request) {
    await dbConnect()

    // Authenticate the user
    const headersList = await headers()
    const token = extractBearerFromHeaders(headersList);
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return NextResponse.json({
            message: 'Unauthorized'
        }, { status: 401 });
    }

    // Remove the token from the database
    await Session.deleteOne({ sessionId: token });

    return new Response('Logged out');
}
