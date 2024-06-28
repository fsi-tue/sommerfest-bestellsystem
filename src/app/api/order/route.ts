import mongoose from "mongoose";
import { Food, FoodDocument } from "@/model/food";
import dbConnect from "@/lib/dbConnect";
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import { Order } from "@/model/order";
import { constants, ORDER } from "@/config";
import { System } from "@/model/system";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    await dbConnect();

    // Authenticate the user
    /* const headersList = headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return NextResponse.json({
            message: 'Unauthorized'
        }, { status: 401 });
    } */

    const orders = await Order.find();
    const foods = await Food.find();

    const transformedOrders = await Promise.all(orders.map(async order => {

        /*
        // Get all orders that were ordered before this order and are not finished
        const ordersBefore = orders.filter(orderBefore => orderBefore.orderDate < order.orderDate && (!['delivered', 'cancelled'].includes(orderBefore.status)));
        const orderBeforeItemsTotal = ordersBefore.map(order => order.items).flat();
        const totalTime = orderBeforeItemsTotal.length * ORDER.TIME_PER_ORDER + // Time for the pizzas BEFORE THIS order
            order.items.length * ORDER.TIME_PER_ORDER; // Time for the pizzas IN THIS order
         */

        // Get the foods for the order
        const foodsForOrder = foods.filter((food: any) => order.items.includes(food._id));

        // Create a map of food details
        const foodById = foodsForOrder
            .reduce((map: { [id: string]: FoodDocument }, food: any) => {
                map[food._id.toString()] = food;
                return map;
            }, {});


        return {
            _id: order._id,
            name: order.name,
            comment: order.comment || "",
            items: order.items.map(pizzaId => foodById[pizzaId.toString()]),
            orderDate: order.orderDate,
            timeslot: order.timeslot, // new Date(order.orderDate.getTime() + totalTime),
            totalPrice: order.totalPrice,
            finishedAt: order.finishedAt,
            status: order.status
        }
    }))

    return Response.json(transformedOrders);
}

export async function POST(req: Request) {
    await dbConnect();

    // Check system status
    const system = await System.findOne({ name: constants.SYSTEM_NAME });
    if (system && system.status !== 'active') {
        console.error('System is not active', system.status);
        return NextResponse.json({
            message: 'System is not active'
        }, { status: 400 });
    }

    // Get the body of the request
    const { pizzas: items, name, comment, timeslot } = await req.json();

    // Check if there are too many or too few items
    const currentOrderItemsTotal = items
        .reduce((total: number, item: { size: number }) => total + item.size, 0);
    console.log('Current order items total:', currentOrderItemsTotal);
    if (currentOrderItemsTotal > ORDER.MAX_ITEMS_PER_TIMESLOT || items.length < 1) {
        return NextResponse.json({
            message: 'Too many or too few items'
        }, { status: 400 });
    }

    // Sum up all items in the current order


    // Check if the pizzas are valid
    const foodIds: string[] = items.map((pizza: { _id: string }) => pizza._id);
    if (!foodIds.every(async (foodId: string) => await Food.exists({ _id: foodId }))) {
        console.error('Some items are missing', items);
        return NextResponse.json({
            message: 'Some items are missing'
        }, { status: 400 });
    }

    // Find orders with the same time slot
    const orders = await Order.find(
        {
            timeslot: timeslot,
            status: { $nin: ['delivered', 'cancelled'] }
        }
    );
    // Find all food items
    const food = await Food.find();
    const foodById = food
        .reduce((map: { [id: string]: FoodDocument }, food: any) => {
            map[food._id.toString()] = food;
            return map;
        }, {});
    // Sum up all items in the orders
    const orderItemsTotal = orders
        .flatMap(order => order.items)
        .reduce((total, item) => total + foodById[item._id].size, 0);
    // Check if the total number of items is not too high
    console.log('Order items total:', orderItemsTotal, currentOrderItemsTotal);
    if (orderItemsTotal + currentOrderItemsTotal > ORDER.MAX_ITEMS_PER_TIMESLOT) {
        return NextResponse
            .json({
                message: `There are too many items in this time slot. Please choose another time slot.`
            }, { status: 400 });
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
    order.name = (name || "anonymous").slice(0, 30);
    order.items = items
    order.totalPrice = totalPrice;
    order.comment = (comment || "No comment").slice(0, 500);
    order.timeslot = timeslot;
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
