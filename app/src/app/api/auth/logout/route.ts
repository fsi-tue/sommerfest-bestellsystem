import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import { Session } from "@/model/session";
import dbConnect from "@/lib/dbConnect";

/**
 * POST /logout
 * Logout endpoint
 */
export async function POST(req: Request) {
    await dbConnect()

    // Authenticate the user
    const headersList = headers()
    const token = extractBearerFromHeaders(headersList);
    if (!await validateToken(token)) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Remove the token from the database
    await Session.deleteOne({ sessionId: token });

    return new Response('Logged out');
}
