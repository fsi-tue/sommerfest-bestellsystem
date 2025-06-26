// api/order/batch

import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import { OrderModel, OrderStatus } from "@/model/order";
import { NextRequest } from "next/server";


export async function POST(request: NextRequest) {
    await dbConnect();

    // Get IDs
    const { orderIds } = await request.json() as { orderIds: string[] }

    // Check if the ID is valid and ObjectId
    if (!orderIds || orderIds.some(orderId => !Types.ObjectId.isValid(orderId))) {
        return new Response(`
            The ID are not valid.
        `, { status: 400 });
    }

    // Batch fetch all order statuses in a single database query
    const orders = await OrderModel.find({
        _id: { $in: orderIds }
    }).select('_id status').lean();

    const statusMap = orders.reduce((acc: { [id: string]: OrderStatus }, order) => {
        acc[order._id.toString()] = order.status;
        return acc;
    }, {});

    return Response.json(statusMap);
}
