import dbConnect from "@/lib/dbConnect";
import { getSystemStatus } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Set the system status
 * @constructor
 */
export async function GET(request: Request) {
    await dbConnect();
    return Response.json({ status: await getSystemStatus() })
}
