import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { OrderModel } from "@/model/order";
import { NextRequest } from "next/server";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    // Get the ID from the URL
    const { id } = await params

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

    // Find the order by ID
    const order = await OrderModel.findById(id).lean();
    if (!order) {
        return new Response(`
            The order with the ID ${id} was not found.
            Are you sure you copied the right ID?
            Stop making up IDs and try again.
        `, { status: 404 });
    }

    // Transform the order
    const transformedOrder = {
        _id: order._id,
        name: order.name,
        comment: order.comment ?? "",
        items: order.items.map(item => ({
            item: item.item,
            status: item.status
        })),
        orderDate: order.orderDate,
        timeslot: order.timeslot,
        totalPrice: order.totalPrice,
        status: order.status,
        isPaid: order.isPaid,
        finishedAt: order.finishedAt,
    }

    // Send the order
    return Response.json(transformedOrder);
}
