import { Session } from "@/model/session";

import dbConnect from "@/lib/dbConnect";
import { cookies } from "next/headers";

import { cache } from "react";
import { SYSTEM_NAME } from "@/config";
import { SystemDocument, SystemModel } from "@/model/system";

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


export async function getSystem(): Promise<SystemDocument> {
    const system = await SystemModel.findOne({ name: SYSTEM_NAME }).lean();
    if (!system) {
        throw new Error('System not found');
    }

    return system;
}

export async function requireActiveSystem(): Promise<SystemDocument> {
    const system = await getSystem();
    if (!system.status.active) {
        throw new Error(system.status.message ?? 'System is not active');
    }
    return system;
}
