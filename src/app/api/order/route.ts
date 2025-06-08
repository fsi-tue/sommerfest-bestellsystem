import mongoose from "mongoose";
import { ItemModel } from "@/model/item";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/serverAuth";
import { ApiOrder, ITEM_STATUS_VALUES, OrderModel } from "@/model/order";
import { ORDER_CONFIG } from "@/config";
import { NextResponse } from "next/server";
import { requireActiveSystem } from "@/lib/system";

export async function GET(request: Request) {
    try {
        await dbConnect();
        await requireAuth();

        const orders = await OrderModel.find()
            .select('name comment items orderDate timeslot totalPrice status isPaid finishedAt')
            .lean()
            .exec()

        const transformedOrders = orders.map(order => ({
            ...order,
            comment: order.comment ?? "",
            items: order.items.map(item => ({
                item: item.item,
                status: item.status
            }))
        }));

        return NextResponse.json(transformedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { message: 'There was an error on our side' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        await requireActiveSystem();

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
                { message: 'You have too many items in your order' },
                { status: 400 }
            );
        }

        // Validate item items exist
        const itemIds = [...new Set(flatItems.map(item => item._id.toString()))]

        const [existingItems, existingOrders] = await Promise.all([
            ItemModel.find({ _id: { $in: itemIds } }).select('_id price size').lean(),
            OrderModel.find({
                timeslot: timeslot,
                status: { $nin: ['cancelled'] }
            }).select('items').lean()
        ]);


        if (existingItems.length !== itemIds.length) {
            return NextResponse.json(
                { message: `These items exist: ` + existingItems.map(item => item._id) + ' but the following were ordered: ' + itemIds },
                { status: 400 }
            );
        }

        const capacityCheck = await OrderModel.aggregate([
            {
                $match: {
                    timeslot: timeslot,
                    status: { $nin: ['cancelled'] }
                }
            },
            {
                $unwind: '$items'
            },
            {
                $group: {
                    _id: null,
                    totalSize: { $sum: '$items.item.size' }
                }
            }
        ]);
        let existingItemsTotal = 0
        if (capacityCheck.length > 0) {
            existingItemsTotal = capacityCheck[0].totalSize as number
        }

        // Check timeslot capacity
        /* const existingOrders = await OrderModel.find({
            timeslot: timeslot,
            status: { $nin: ['cancelled'] }
        }).lean();

        const existingItemsTotal = existingOrders
            .flatMap(order => order.items)
            .reduce((total, orderItem) => {
                const item = orderItem.item as ItemDocument;
                return total + (item?.size ?? 0);
            }, 0); */

        if (existingItemsTotal + currentOrderItemsTotal > ORDER_CONFIG.MAX_ITEMS_PER_TIMESLOT) {
            return NextResponse.json({
                message: 'The time slot is already full. Please choose another time slot.'
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
            { message: 'There was an error on our side' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        await requireAuth();

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
            { message: 'There was an error on our side' },
            { status: 500 }
        );
    }
}
