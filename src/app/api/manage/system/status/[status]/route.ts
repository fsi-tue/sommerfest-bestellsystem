// Fill the database
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { System } from "@/model/system";
import { CONSTANTS } from "@/config";
import { NextResponse } from "next/server";

// Thanks to https://medium.com/phantom3/next-js-14-build-prerender-error-fix-f3c51de2fe1d
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


/**
 * Set the system status
 * @constructor
 */
export async function POST(request: Request,
                           { params }: { params: Promise<{ status: string }> }
) {

    await dbConnect();

// Authenticate the user
    const headersList = await headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return NextResponse.json({
            message: 'Unauthorized'
        }, { status: 401 });
    }

// Set the system status
    const system = await System.findOne({ name: CONSTANTS.SYSTEM_NAME });

    if (!system) {
        console.error("Unable to find system");
        return NextResponse.json({
            message: 'System not found'
        }, { status: 500 });
    }

    const { status } = await params
    system.status = status as 'active' | 'inactive' | 'maintenance';

// Save the updated system
    await system.save()

    return Response.json({ message: 'Successfully filled database' })
}
