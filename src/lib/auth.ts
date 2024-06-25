import dbConnect from "@/lib/dbConnect";
import { Session } from "@/model/session";
import moment from "moment";

/**
 * Extracts the Bearer token from the headers
 * @param headers
 */
export function extractBearerFromHeaders(headers: Headers): string {
    const authHeader = headers.get('Authorization');
    if (!authHeader) {
        return '';
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return '';
    }

    if (parts[0] !== 'Bearer') {
        return '';
    }

    return parts[1];
}

/**
 * Validates the token
 * @param token
 */
export async function validateToken(token: string): Promise<boolean> {
    await dbConnect()

    if (token.trim() === '') {
        return false;
    }

    console.log('Validating token', token)
    const session = await Session.findOne({ token: token }).exec();
    if (!session) {
        console.log('Session not found')
        return false;
    }

    const isValid = !moment().isAfter(session.expiresAt);

    console.log(`Token ${token} is valid: ${isValid} - Expires at: ${session.expiresAt} - Current time: ${moment().format()}`)
    return isValid;
}
