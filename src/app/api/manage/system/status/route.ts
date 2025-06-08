import dbConnect from "@/lib/dbConnect";
import { getSystemStatus } from "@/lib/system";

// Thanks to https://medium.com/phantom3/next-js-14-build-prerender-error-fix-f3c51de2fe1d
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
