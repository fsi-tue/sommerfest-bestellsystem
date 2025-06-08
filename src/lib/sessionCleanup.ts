// lib/sessionCleanup.ts
import dbConnect from "@/lib/dbConnect";
import { Session } from "@/model/session";

export async function cleanupExpiredSessions() {
    await dbConnect();

    try {
        const result = await Session.deleteMany({
            expiresAt: { $lt: new Date() }
        });

        console.log(`Cleaned up ${result.deletedCount} expired sessions`);
    } catch (error) {
        console.error('Session cleanup error:', error);
    }
}
