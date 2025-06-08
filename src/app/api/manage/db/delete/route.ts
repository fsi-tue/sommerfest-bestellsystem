// Fill the database
import { ItemModel } from "@/model/item";
import { requireAuth } from "@/lib/serverAuth";
import dbConnect from "@/lib/dbConnect";
import { OrderModel } from "@/model/order";

// Thanks to https://medium.com/phantom3/next-js-14-build-prerender-error-fix-f3c51de2fe1d
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Delete the database
 * @constructor
 */
export async function POST() {
    await dbConnect();
    await requireAuth();

    await ItemModel.deleteMany({})
    await OrderModel.deleteMany({})

    return Response.json({ message: 'Successfully deleted database' })
}
