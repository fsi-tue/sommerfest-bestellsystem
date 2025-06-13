import dbConnect from "@/lib/dbConnect";
import { getSystemStatus } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * GET the system status
 * @constructor
 */
export async function GET(request: Request) {
    await dbConnect();
    return Response.json({ status: await getSystemStatus(), timestamp: new Date() });
}
