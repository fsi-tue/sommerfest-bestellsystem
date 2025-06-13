import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { ORDER_STATUSES, OrderModel } from "@/model/order";
import { NextRequest } from "next/server";
import { ObjectId } from "bson";

/**
 * Allow user to cancel an order.
 * @constructor
 * @param request
 * @param params
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    // Get the ID from the URL
    const { id } = await params

    // Check if the ID is valid and ObjectId
    if (!id || !ObjectId.isValid(id)) {
        return new Response(`
            The ID is not valid.
            Please provide a valid ID.
            We can't find anything with this ID.
        `, { status: 400 });
    }

    try {
        // Find the order by ID
        const foundOrder = await OrderModel.findById(id);

        if (!foundOrder) {
            return new Response('Order not found', { status: 404 });
        }

        // Check if the order is already delivered or ready
        if (ORDER_STATUSES.DELIVERED === foundOrder.status ||
            ORDER_STATUSES.READY === foundOrder.status ||
            ORDER_STATUSES.CANCELLED === foundOrder.status ||
            ORDER_STATUSES.IN_PREPARATION === foundOrder.status) {
            return new Response(`Order was already ${foundOrder.status}. Cannot cancel!`, { status: 400 });
        }

        // Update the order status
        foundOrder.status = 'cancelled'
        await foundOrder.save();

        return Response.json(foundOrder);
    } catch (error) {
        console.error('Error cancel order:', error);
        return new Response('Error cancel order', { status: 500 });
    }
}
