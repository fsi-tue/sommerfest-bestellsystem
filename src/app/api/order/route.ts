// api/order

import { NextResponse } from 'next/server';
import { Types } from 'mongoose';

import dbConnect from '@/lib/dbConnect';
import { requireActiveSystem, requireAuth } from '@/lib/auth/serverAuth';
import { ORDER_STATUSES, OrderModel, SimpleOrder } from '@/model/order';
import { ItemModel } from '@/model/item';
import { ItemTicketModel, TICKET_STATUS } from '@/model/ticket';

const dbReady = dbConnect();

const withDB = async <T>(fn: () => Promise<T>) => {
    await dbReady;
    return fn();
};

export async function GET() {
    return withDB(async () => {
        await requireAuth();

        const orders = await OrderModel.aggregate([
            {
                $project: {
                    name: 1,
                    orderDate: 1,
                    timeslot: 1,
                    totalPrice: 1,
                    status: 1,
                    isPaid: 1,
                    finishedAt: 1,
                    comment: { $ifNull: ['$comment', ''] },
                    items: {
                        $map: {
                            input: '$items',
                            as: 'i',
                            in: '$$i',
                        },
                    },
                },
            },
        ])
            // Sort them
            .sort({ timeslot: 1 });

        return NextResponse.json(orders);
    }).catch((err) => {
        console.error('GET /order error ➜', err);
        return NextResponse.json(
            { message: 'There was an error on our side' },
            { status: 500 },
        );
    });
}

export async function POST(req: Request) {
    return withDB(async () => {
        const system = await requireActiveSystem();

        const MAX_ORDER_THRESHOLD = system.config.ORDER_CONFIG.ORDER_AMOUNT_THRESHOLDS.MAX

        const body = (await req.json()) as SimpleOrder;

        if (!body.timeslot) {
            return NextResponse.json(
                { message: 'Timeslot is required' },
                { status: 400 },
            );
        }

        const items = Object.values(body.items ?? {}).flat();
        if (items.length === 0) {
            return NextResponse.json(
                { message: 'At least one item is required' },
                { status: 400 },
            );
        }

        const newSize = items.reduce((acc, i) => acc + i.size, 0);
        if (newSize > MAX_ORDER_THRESHOLD) {
            return NextResponse.json(
                { message: 'Too many items for one order' },
                { status: 400 },
            );
        }


        const itemIds = [
            ...new Set(items.map((i) => i._id)),
        ].map((id) => new Types.ObjectId(id));

        const [{ capacity }] = await OrderModel.aggregate([
            {
                $facet: {
                    capacity: [
                        {
                            $match: {
                                timeslot: body.timeslot,
                                status: { $ne: 'cancelled' },
                            },
                        },
                        { $unwind: '$items' },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: '$items.size' },
                            },
                        },
                    ],
                },
            },
        ]);

        // Validate that items really exist
        const existingItems = await ItemModel.find({ _id: { $in: itemIds } })
            .lean();

        if (existingItems.length !== itemIds.length) {
            throw new Error('Invalid item ids provided');
        }

        const alreadyBooked = capacity?.[0]?.total ?? 0;
        if (alreadyBooked + newSize > MAX_ORDER_THRESHOLD) {
            throw new Error(
                'The timeslot is already full. Please choose another one.',
            );
        }

        // TODO: Add buffer

        /* price calculation */
        const priceMap = existingItems.reduce<Record<string, number>>(
            (map, it) => {
                map[it._id.toString()] = it.price;
                return map;
            },
            {},
        );

        const totalPrice = items.reduce(
            (sum, i) => sum + (priceMap[i._id.toString()] ?? 0),
            0,
        );

        // build and save the order
        const newOrderDocument = await new OrderModel({
            name: (body.name ?? 'anonymous').slice(0, 30),
            comment: (body.comment ?? 'No comment').slice(0, 500),
            items: items,
            timeslot: body.timeslot,
            totalPrice,
        }).save();

        console.log('New order created:', newOrderDocument._id);

        // Process each order item
        for (const savedOrderItem of newOrderDocument.items) {
            // Try to find and assign a ready ticket
            const assignedTicket = await ItemTicketModel.findOneAndUpdate(
                {
                    itemTypeRef: savedOrderItem._id,
                    status: TICKET_STATUS.READY,
                    orderId: null,
                },
                {
                    $set: {
                        status: TICKET_STATUS.READY,
                        orderId: newOrderDocument._id,
                        timeslot: newOrderDocument.timeslot,
                    }
                },
                {
                    new: true,
                    sort: { createdAt: 1 }
                }
            );

            if (assignedTicket) {
                console.log('Assigned ready ticket:', assignedTicket._id);
            } else {
                // No ready ticket available, create a demanded ticket
                const newTicket = await ItemTicketModel.create({
                    itemTypeRef: savedOrderItem._id,
                    status: TICKET_STATUS.DEMANDED,
                    orderId: newOrderDocument._id,
                    timeslot: newOrderDocument.timeslot,
                });

                console.log('Created demanded ticket:', newTicket._id);
            }
        }

        return NextResponse.json(newOrderDocument);
    }).catch((err) => {
        console.error('POST /order error ➜', err);
        return NextResponse.json(
            { message: err.message || 'There was an error on our side' },
            { status: 500 },
        );
    });
}


export async function PUT(req: Request) {
    return withDB(async () => {
        await requireAuth();

        const { id, order } = (await req.json())

        if (!id || !Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: 'Invalid order ID' },
                { status: 400 },
            );
        }

        const updatedOrder = await OrderModel.findByIdAndUpdate(
            id,
            { $set: order },
            { new: true, runValidators: true }
        );
        if (!updatedOrder) {
            return NextResponse.json(
                { message: 'Order not found' },
                { status: 404 },
            );
        }

        await updatedOrder.save();

        if (updatedOrder.status === ORDER_STATUSES.COMPLETED) {
            await ItemTicketModel.updateMany(
                { orderId: updatedOrder._id },
                {
                    status: TICKET_STATUS.COMPLETED,
                }
            );
        } else if (updatedOrder.status === ORDER_STATUSES.CANCELLED) {
            await ItemTicketModel.updateMany(
                { orderId: updatedOrder._id },
                {
                    orderId: null
                }
            );
        } else if (updatedOrder.status === ORDER_STATUSES.ACTIVE) {
            await ItemTicketModel.updateMany(
                { orderId: updatedOrder._id },
                {
                    status: TICKET_STATUS.READY,
                }
            );
        }

        return NextResponse.json(updatedOrder);
    }).catch((err) => {
        console.error('PUT /order error ➜', err);
        return NextResponse.json(
            { message: 'There was an error on our side' },
            { status: 500 },
        );
    });
}
