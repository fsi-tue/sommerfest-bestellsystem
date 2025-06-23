// api/order/[id]/cancel

import dbConnect from "@/lib/dbConnect";
import { ORDER_STATUSES, OrderModel } from "@/model/order";
import { NextRequest } from "next/server";
import { ObjectId } from "bson";
import { ItemTicketModel } from "@/model/ticket";

/**
 * Allow user to cancel an order. This is still okay, since only knowing the id does not
 * @constructor
 * @param request
 * @param params
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    // Get the ID from the URL
    const { id } = await params
    const { name } = (await request.json()) as { name: string };

    // Check if the ID is valid and ObjectId
    if (!id || !ObjectId.isValid(id)) {
        return new Response('The ID is not valid.', { status: 400 });
    }

    try {
        // Find the order by ID
        const foundOrder = await OrderModel.findById(id);

        // Check if the name is also the same
        if (!foundOrder || foundOrder.name !== name) {
            return new Response('Order not found', { status: 404 });
        }

        // Check if the order is already completed or ready
        if (ORDER_STATUSES.COMPLETED === foundOrder.status ||
            ORDER_STATUSES.READY_FOR_PICKUP === foundOrder.status ||
            ORDER_STATUSES.CANCELLED === foundOrder.status ||
            ORDER_STATUSES.ACTIVE === foundOrder.status) {
            return new Response(`Order was ${foundOrder.status}. Cannot cancel!`, { status: 400 });
        }

        // Update the order status
        foundOrder.status = ORDER_STATUSES.CANCELLED;
        await foundOrder.save();

        await ItemTicketModel.updateMany(
            { orderId: foundOrder._id },
            {
                orderId: null,
                timestamp: null
            }
        );

        return Response.json(foundOrder);
    } catch (error) {
        console.error('Error cancel order:', error);
        return new Response('Error cancel order', { status: 500 });
    }
}
