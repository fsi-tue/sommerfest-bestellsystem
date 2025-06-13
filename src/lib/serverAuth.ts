import { Session } from "@/model/session";

import dbConnect from "@/lib/dbConnect";
import { cookies } from "next/headers";

import { cache } from "react";
import { CONSTANTS } from "@/config";
import { System } from "@/model/system";

export const getAuthToken = async () => {
    const cookieStore = await cookies();
    return cookieStore.get('auth-token')?.value;
}

export const getValidToken = cache(async () => {
    const authToken = await getAuthToken()

    if (!authToken) {
        return null;
    }

    const isValid = await validateSession(authToken);
    if (!isValid) {
        return null;
    }

    return authToken;
});


export async function requireAuth() {
    const authToken = await getValidToken()
    if (!authToken) {
        throw new Error('Unauthorized');
    }
    return authToken;
}

export async function validateSession(token?: string): Promise<boolean> {
    if (!token) {
        return false;
    }

    await dbConnect();

    try {
        const session = await Session.findOne({
            token,
            expiresAt: { $gt: new Date() } // Check if not expired
        });

        return !!session;
    } catch (error) {
        console.error('Session validation error:', error);
        return false;
    }
}

export async function getSessionUser(token: string): Promise<string | null> {
    if (!token) {
        return null;
    }

    await dbConnect();

    try {
        const session = await Session.findOne({
            token,
            expiresAt: { $gt: new Date() }
        });

        return session?.userId || null;
    } catch (error) {
        console.error('Get session user error:', error);
        return null;
    }
}


export async function getSystemStatus() {
    const system = await System.findOne({ name: CONSTANTS.SYSTEM_NAME }).lean();
    if (!system) {
        throw new Error('System not found');
    }

    return system.status;
}

export async function requireActiveSystem() {
    if (await getSystemStatus() !== 'active') {
        throw new Error('System is not active');
    }
    return true;
}
