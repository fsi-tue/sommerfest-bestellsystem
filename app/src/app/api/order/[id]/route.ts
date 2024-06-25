import dbConnect from "@/lib/dbConnect";

const moment = require('moment-timezone');
import mongoose from "mongoose";
import { Order } from "@/model/order";
import { Pizza, PizzaDocument } from "@/model/pizza";
import { constants } from "@/config";
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";


export async function GET(req: Request) {
    await dbConnect();

    // Authenticate the user
    const headersList = headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Get the ID from the URL
    const id = req.params.id;

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

    // Map the pizza details to the order.pizzas array
    order.pizzas = order.pizzas.map(pizzaId => pizzaDetailsMap[pizzaId.toString()]);

    function transformDateKeysToMoment(order: any) {
        return {
            _id: order._id,
            name: order.name,
            pizzas: order.pizzas,
            orderDate: moment(order.orderDate).tz(constants.TIMEZONE_ORDERS).format(),
            totalPrice: order.totalPrice,
            finishedAt: moment(order.finishedAt).tz(constants.TIMEZONE_ORDERS).format(),
            status: order.status,
        };
    }

    const transformedObject = transformDateKeysToMoment(order);

    // Send the order
    return Response.json(transformedObject);
}
