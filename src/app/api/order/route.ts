import mongoose from "mongoose";
import { Food, FoodDocument } from "@/model/food";
import dbConnect from "@/lib/dbConnect";
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import { Order } from "@/model/order";
import { ORDER } from "@/config";

export async function GET(req: Request) {
    await dbConnect();

    // Authenticate the user
    /* const headersList = headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return new Response('Unauthorized', { status: 401 });
    } */

    const orders = await Order.find();
    const foods = await Food.find();

    const transformedOrders = await Promise.all(orders.map(async order => {
        // Get all orders that were ordered before this order and are not finished
        const ordersBefore = orders.filter(orderBefore => orderBefore.orderDate < order.orderDate && (!['delivered', 'cancelled'].includes(orderBefore.status)));
        const orderBeforeItemsTotal = ordersBefore.map(order => order.items).flat();
        const totalTime = orderBeforeItemsTotal.length * ORDER.TIME_PER_ORDER + // Time for the pizzas BEFORE THIS order
            order.items.length * ORDER.TIME_PER_ORDER; // Time for the pizzas IN THIS order

        // Get the foods for the order
        const foodsForOrder = foods.filter((food: any) => order.items.includes(food._id));

        // Create a map of food details
        const foodDetailsMap = foodsForOrder
            .reduce((map: { [id: string]: FoodDocument }, food: any) => {
                map[food._id.toString()] = food;
                return map;
            }, {});

        return {
            _id: order._id,
            name: order.name,
            items: order.items.map(pizzaId => foodDetailsMap[pizzaId.toString()]),
            orderDate: order.orderDate,
            timeslot: new Date(order.orderDate.getTime() + totalTime),
            totalPrice: order.totalPrice,
            finishedAt: order.finishedAt,
            status: order.status
        }
    }))

    return Response.json(transformedOrders);
}

export async function POST(req: Request) {
    await dbConnect();

    // Get the body of the request
    const { pizzas: items, name } = await req.json();

    // Check if there are too many pizzas
    if (items.length > ORDER.MAX_ITEMS_PER_ORDER || items.length < 1) {
        console.error('Too many or too few items', items.length);
        return new Response(`Too many or too few items.
                                        We don't know what to do with that.
                                        Can't you just order a normal amount of food?`
        );
    }

    // Check if the pizzas are valid
    const foodIds: string[] = items.map((pizza: { _id: string }) => pizza._id);
    if (!foodIds.every(async (pizzaId: string) => await Food.exists({ _id: pizzaId }))) {
        console.error('Some pizzas are missing', items);
        return new Response(`Some of the food you ordered seem to have vanished into the abyss.
                            Are you trying to order ghost food?
                            Let's try ordering real ones this time!`, { status: 400 });
    }

    // Calculate the total price.
    // Don't trust the price from the request body
    const totalPrice: number = await foodIds
        .reduce(async (total: Promise<number>, foodId: string) => {
            const food = await Food.findOne({ _id: foodId });
            if (!food) {
                console.error('Pizza not found', foodId)
                return total;
            }
            return await total + food.price;
        }, Promise.resolve(0));

    // Create the order
    const order = new Order();
    order.name = name || "anonymous";
    order.items = items
    order.totalPrice = totalPrice;
    order.comment = "No comment";
    await order.save()

    // Get the order ID
    const orderId = order._id;

    // Send the order ID
    return Response.json({ orderId });
}

export async function PUT(req: Request) {
    await dbConnect();

    // Authenticate the user
    const headersList = headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Get the order details from the request body
    const { id, status } = await req.json()

    if (!id || !mongoose.isValidObjectId(id)) {
        console.error('Invalid ID:', id);
        return new Response('Invalid ID', { status: 400 });
    }


    try {
        // Find the order by ID
        const foundOrder = await Order.findById(id);

        if (!foundOrder) {
            return new Response('Order not found', { status: 404 });
        }

        // Update the order status
        foundOrder.status = status;

        // Save the updated order
        await foundOrder.save();

        // console.log('Order updated:', foundOrder)
        return Response.json(foundOrder);
    } catch (error) {
        console.error(`Error setting order as ${status}:`, error);
        return new Response(`Error setting order as ${status}:`, { status: 500 });
    }
}
