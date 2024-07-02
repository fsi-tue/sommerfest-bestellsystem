// Fill the database
import dbConnect from "@/lib/dbConnect";
import { System } from "@/model/system";
import { constants } from "@/config";
import { NextResponse } from "next/server";

// Thanks to https://medium.com/phantom3/next-js-14-build-prerender-error-fix-f3c51de2fe1d
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


/**
 * Set the system status
 * @constructor
 */
export async function GET(req: Request, { params }: { params: { status: string } }) {
    await dbConnect();

    // Set the system status
    const system = await System.findOne({ name: constants.SYSTEM_NAME });

    if (!system) {
        return NextResponse.json({
            message: 'System not found'
        }, { status: 404 });
    }

    return Response.json({ status: system.status })
}
