// Fill the database
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { System } from "@/model/system";
import { constants } from "@/config";

// Thanks to https://medium.com/phantom3/next-js-14-build-prerender-error-fix-f3c51de2fe1d
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


/**
 * Set the system status
 * @constructor
 */
export async function POST(req: Request, { params }: { params: { status: string } }) {
    await dbConnect();

    // Authenticate the user
    const headersList = headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Set the system status
    const system = await System.findOne({ name: constants.SYSTEM_NAME });

    if (!system) {
        return new Response('System not found', { status: 404 });
    }

    // Get the status from the URL
    system.status = params.status as 'active' | 'inactive' | 'maintenance';

    // Save the updated system
    await system.save()

    return Response.json({ message: 'Successfully filled database' })
}
