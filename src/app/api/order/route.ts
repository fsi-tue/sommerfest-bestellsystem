import mongoose from "mongoose";
import { ItemDocument, ItemModel } from "@/model/item";
import dbConnect from "@/lib/dbConnect";
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import { ApiOrder, ITEM_STATUS_VALUES, OrderModel } from "@/model/order";
import { CONSTANTS, ORDER_CONFIG } from "@/config";
import { System } from "@/model/system";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        await dbConnect();

        // Authenticate the user
        const headersList = await headers();
        if (!await validateToken(extractBearerFromHeaders(headersList))) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Use populate to efficiently join item data
        const orders = await OrderModel.find()

        const transformedOrders = orders.map(order => ({
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
        }));

        return NextResponse.json(transformedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// #### POST - Create a new order
export async function POST(request: Request) {
    try {
        await dbConnect();

        const system = await System.findOne({ name: CONSTANTS.SYSTEM_NAME });
        if (system?.status !== 'active') {
            console.error('System is not active:', system?.status);
            return NextResponse.json(
                { message: 'System is not active' },
                { status: 400 }
            );
        }

        const { items, name, comment, timeslot } = await request.json() as ApiOrder;

        const flatItems = Object.values(items).flat();

        if (flatItems.length < 1) {
            return NextResponse.json(
                { message: 'At least one item is required' },
                { status: 400 }
            );
        }

        const currentOrderItemsTotal = flatItems.reduce(
            (total, item) => total + item.size,
            0
        );

        if (currentOrderItemsTotal > ORDER_CONFIG.MAX_ITEMS_PER_TIMESLOT) {
            return NextResponse.json(
                { message: 'Too many items in order' },
                { status: 400 }
            );
        }

        // Validate item items exist
        const itemIds = flatItems.map(item => item._id);
        const existingItems = await ItemModel.find({
            _id: { $in: itemIds }
        }).lean();

        if (existingItems.length !== itemIds.length) {
            return NextResponse.json(
                { message: 'Some item items do not exist' },
                { status: 400 }
            );
        }

        // Check timeslot capacity
        const existingOrders = await OrderModel.find({
            timeslot: timeslot,
            status: { $nin: ['cancelled'] }
        }).populate('items.item').lean();

        const existingItemsTotal = existingOrders
            .flatMap(order => order.items)
            .reduce((total, orderItem) => {
                const item = orderItem.item as ItemDocument;
                return total + (item?.size ?? 0);
            }, 0);

        if (existingItemsTotal + currentOrderItemsTotal > ORDER_CONFIG.MAX_ITEMS_PER_TIMESLOT) {
            return NextResponse.json({
                message: 'Time slot is full. Please choose another time slot.'
            }, { status: 400 });
        }

        // Calculate total price from database
        const itemPriceMap = existingItems.reduce((map, item) => {
            map[item._id.toString()] = item.price;
            return map;
        }, {} as Record<string, number>);

        const totalPrice = flatItems.reduce((total, item) => {
            return total + (itemPriceMap[item._id.toString()] ?? 0);
        }, 0);

        const mappedItems = flatItems.map(item => ({
            item: item,
            status: ITEM_STATUS_VALUES[0],
        }))

        // Create and save order
        const order = new OrderModel({
            name: (name || "anonymous").slice(0, 30),
            comment: (comment || "No comment").slice(0, 500),
            items: mappedItems,
            timeslot: timeslot,
            totalPrice: totalPrice
        });

        await order.save();

        return NextResponse.json({ orderId: order._id });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// #### PUT - Update an existing order
export async function PUT(request: Request) {
    try {
        await dbConnect();

        // Authenticate the user
        const headersList = await headers();
        if (!await validateToken(extractBearerFromHeaders(headersList))) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const { id, order } = await request.json();

        if (!id || !mongoose.isValidObjectId(id)) {
            return NextResponse.json(
                { message: 'Invalid order ID' },
                { status: 400 }
            );
        }

        // Find and update order
        const foundOrder = await OrderModel.findById(id);

        if (!foundOrder) {
            return NextResponse.json(
                { message: 'Order not found' },
                { status: 404 }
            );
        }

        // Update order fields
        Object.assign(foundOrder, {
            name: order.name,
            comment: order.comment,
            items: order.items,
            timeslot: order.timeslot,
            totalPrice: order.totalPrice,
            status: order.status,
            isPaid: order.isPaid,
            finishedAt: order.finishedAt
        });

        await foundOrder.save();

        return NextResponse.json(foundOrder);

    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
