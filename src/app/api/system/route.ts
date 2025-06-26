import dbConnect from "@/lib/db";
import { getSystem, requireAuth } from "@/lib/auth/serverAuth";
import { UTCDate } from "@date-fns/utc";
import { SystemDocument, SystemModel } from "@/model/system";
import { NextResponse } from "next/server";
import { SYSTEM_NAME } from "@/config";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * GET the system status
 * @constructor
 */
export async function GET(request: Request) {
    await dbConnect();
    return Response.json({ system: await getSystem(), timestamp: new UTCDate() });
}

/**
 * Set the system status
 * @constructor
 */
export async function PUT(
    request: Request,
) {
    await dbConnect();
    await requireAuth();

    // Set the system status
    const system = await SystemModel.findOne({ name: SYSTEM_NAME });

    if (!system) {
        console.error("Unable to find system");
        return NextResponse.json({
            message: 'System not found'
        }, { status: 500 });
    }

    const updatedSystem = (await request.json()) as SystemDocument
    Object.assign(system, updatedSystem)

    // Save the updated system
    await system.save();

    return NextResponse.json({ message: 'Successfully updated system status' });
}
