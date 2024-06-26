import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { Order } from "@/model/order";

/**
 * Allow user to cancel an order.
 * @param req
 * @param params
 * @constructor
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();

    // Get the ID from the URL
    const id = params.id

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
        const foundOrder = await Order.findById(id);

        if (!foundOrder) {
            return new Response('Order not found', { status: 404 });
        }

        // Check if the order is already delivered or ready
        if (['delivered', 'ready'].includes(foundOrder.status)) {
            return new Response(`Order was already ${foundOrder.status}. Cannot cancel!`, { status: 400 });
        }

        // Update the order status
        foundOrder.status = 'cancelled'

        // Save the updated order
        await foundOrder.save();

        // console.log('Order updated:', foundOrder)
        return Response.json(foundOrder);
    } catch (error) {
        console.error('Error setting order as paid:', error);
        return new Response('Error setting order as paid', { status: 500 });
    }
}
