import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { OrderModel } from "@/model/order";
import { FoodModel, FoodDocument } from "@/model/food";
import { NextRequest } from "next/server";


export async function GET(request: NextRequest) {
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

    // Find the order by ID
    const order = await OrderModel.findById(id);
    if (!order) {
        return new Response(`
            The order with the ID ${id} was not found.
            Are you sure you copied the right ID?
            Stop making up IDs and try again.
        `, { status: 404 });
    }

    // Get the foods for the order
    const foodsDetails = await FoodModel
        .find({ _id: { $in: order.items.map((item) => item.food) } })

    // Create a map of food details
    const foodById = foodsDetails
        .reduce((map: { [id: string]: FoodDocument }, food: any) => {
            map[food._id.toString()] = food;
            return map;
        }, {});

    // Transform the order
    const transformedOrder = {
        _id: order._id,
        name: order.name,
        comment: order.comment ?? "",
        items: order.items.map((item) => ({
            food: foodById[item.food._id.toString()],
            status: item.status
        })),
        orderDate: order.orderDate,
        timeslot: order.timeslot, // new Date(order.orderDate.getTime() + totalTime),
        totalPrice: order.totalPrice,
        status: order.status,
        isPaid: order.isPaid,
        finishedAt: order.finishedAt,
    }

    // Send the order
    return Response.json(transformedOrder);
}
