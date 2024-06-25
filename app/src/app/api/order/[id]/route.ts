import dbConnect from "@/lib/dbConnect";

import moment from 'moment-timezone';
import mongoose from "mongoose";
import { Order } from "@/model/order";
import { Pizza, PizzaDocument } from "@/model/pizza";
import { constants } from "@/config";


export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    // Find the order by ID
    const order = await Order.findById(id);
    if (!order) {
        return new Response(`
            The order with the ID ${id} was not found.
            Are you sure you copied the right ID?
            Stop making up IDs and try again.
        `, { status: 404 });
    }

    // Get the pizzas for the order
    const pizzaDetails = await Pizza
        .find({ _id: { $in: order.pizzas } })
        .select('name price');

    // Create a map of pizza details
    const pizzaDetailsMap = pizzaDetails
        .reduce((map: { [id: string]: PizzaDocument }, pizza: any) => {
            map[pizza._id.toString()] = pizza;
            return map;
        }, {});

    // Transform the order
    const transformedOrder = {
        _id: order._id,
        name: order.name,
        pizzas: order.pizzas.map(pizzaId => pizzaDetailsMap[pizzaId.toString()]),
        orderDate: moment(order.orderDate).tz(constants.TIMEZONE_ORDERS).format(),
        totalPrice: order.totalPrice,
        finishedAt: moment(order.finishedAt).tz(constants.TIMEZONE_ORDERS).format(),
        status: order.status,
    }

    // Send the order
    return Response.json(transformedOrder);
}
