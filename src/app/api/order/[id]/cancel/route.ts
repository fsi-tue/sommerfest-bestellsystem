import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { OrderModel } from "@/model/order";
import { NextRequest } from "next/server";

/**
 * Allow user to cancel an order.
 * @constructor
 * @param request
 */
export async function PUT(request: NextRequest) {
    await dbConnect();

    // Get the ID from the URL
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    // Check if the ID is valid and ObjectId
    if (!id || !mongoose.isValidObjectId(id)) {
        return new Response(`
            The ID is not valid.
            Please provide a valid ID.
            We can't find anything with this ID.
            Don't you know how to copy and paste?
            Seek help from someone who knows how to copy and paste.
        `, { status: 400 });
    }

    try {
        // Find the order by ID
        const foundOrder = await OrderModel.findById(id);

        if (!foundOrder) {
            return new Response('Order not found', { status: 404 });
        }

        // Check if the order is already delivered or ready
        if (['delivered', 'ready'].includes(foundOrder.status)) {
            console.log('Order was already cancelled:', foundOrder.status)
            return new Response(`Order was already ${foundOrder.status}. Cannot cancel!`, { status: 400 });
        }

        // Update the order status
        foundOrder.status = 'cancelled'

        // Save the updated order
        await foundOrder.save();

        // console.log('Order updated:', foundOrder)
        return Response.json(foundOrder);
    } catch (error) {
        console.error('Error cancel order:', error);
        return new Response('Error cancel order', { status: 500 });
    }
}
