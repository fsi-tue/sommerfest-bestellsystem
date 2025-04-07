import mongoose from "mongoose";
import { FoodModel, FoodDocument } from "@/model/food";
import dbConnect from "@/lib/dbConnect";
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import { OrderModel } from "@/model/order";
import { constants, ORDER } from "@/config";
import { System } from "@/model/system";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    await dbConnect();

    // Authenticate the user
    const headersList = await headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return NextResponse.json({
            message: 'Unauthorized'
        }, { status: 401 });
    }

    const orders = await OrderModel.find();
    const foods = await FoodModel.find();

    const transformedOrders = await Promise.all(orders.map(async order => {
        // Get the foods for the order
        const foodsForOrder = foods.filter((food) => order.items.some((item) => item.food.toString() === food._id.toString()));

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
    }))

    return Response.json(transformedOrders);
}

export async function POST(request: Request) {
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
    const { pizzas: items, name, comment, timeslot } = await request.json();
    console.log(items)

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
    if (!foodIds.every(async (foodId: string) => await FoodModel.exists({ _id: foodId }))) {
        console.error('Some items are missing', items);
        return NextResponse.json({
            message: 'Some items are missing'
        }, { status: 400 });
    }

    // Find orders with the same time slot
    const orders = await OrderModel.find(
        {
            timeslot: timeslot,
            status: { $nin: ['cancelled'] }
        }
    );
    // Find all food items
    const food = await FoodModel.find();
    const foodById = food
        .reduce((map: { [id: string]: FoodDocument }, food) => {
            map[food._id.toString()] = food;
            return map;
        }, {});
    // Sum up all items in the orders
    const orderItemsTotal = orders
        .flatMap(order => order.items)
        .reduce((total, item) => total + foodById[item.food._id.toString()].size, 0);
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
            const food = await FoodModel.findOne({ _id: foodId });
            if (!food) {
                console.error('Pizza not found', foodId)
                return total;
            }
            return await total + food.price;
        }, Promise.resolve(0));

    // Create the order
    const order = new OrderModel();
    order.name = (name || "anonymous").slice(0, 30);
    order.comment = (comment || "No comment").slice(0, 500);
    order.items = items.map((item: { _id: string }) => ({ food: item._id }));
    order.timeslot = timeslot;
    order.totalPrice = totalPrice;
    await order.save()

    // Get the order ID
    const orderId = order._id;

    // Send the order ID
    return Response.json({ orderId });
}

export async function PUT(request: Request) {
    await dbConnect();

    // Authenticate the user
    const headersList = await headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Get the order details from the request body
    const { id, order } = await request.json()
    console.log('Order:', order)

    if (!id || !mongoose.isValidObjectId(id)) {
        console.error('Invalid ID:', id);
        return new Response('Invalid ID', { status: 400 });
    }


    try {
        // Find the order by ID
        const foundOrder = await OrderModel.findById(id);

        if (!foundOrder) {
            return new Response('Order not found', { status: 404 });
        }

        // Update the order
        foundOrder.name = order.name;
        foundOrder.comment = order.comment;
        foundOrder.items = order.items;
        foundOrder.timeslot = order.timeslot;
        foundOrder.totalPrice = order.totalPrice;
        foundOrder.status = order.status;
        foundOrder.isPaid = order.isPaid;
        foundOrder.finishedAt = order.finishedAt;

        // Save the updated order
        await foundOrder.save();

        // console.log('Order updated:', foundOrder)
        return Response.json(foundOrder);
    } catch (error) {
        console.error(`Error updating order ${id}:`, error);
        return new Response(`Error updating order ${id}`, { status: 500 });
    }
}
