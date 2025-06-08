import { requireAuth } from "@/lib/serverAuth";
import { Session } from "@/model/session";
import dbConnect from "@/lib/dbConnect";

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
