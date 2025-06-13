import dbConnect from "@/lib/dbConnect";
import { getSystemStatus } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const conn = await dbConnect();

/**
 * Set the system status
 * @constructor
 */
export async function GET(request: Request) {
    return Response.json({ status: await getSystemStatus() })
}
