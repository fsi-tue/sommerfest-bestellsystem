import { requireAuth } from "@/lib/auth/serverAuth";
import { Session } from "@/model/session";
import dbConnect from "@/lib/db";

/**
 * POST /logout
 * Logout endpoint
 */
export async function POST(request: Request) {
    await dbConnect()
    const authToken = await requireAuth();

    // Remove the token from the database
    await Session.deleteOne({ sessionId: authToken });

    return new Response('Logged out');
}
