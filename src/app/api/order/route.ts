import { NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';

import dbConnect from '@/lib/dbConnect';
import { requireActiveSystem, requireAuth } from '@/lib/serverAuth';
import { ITEM_STATUS_VALUES, OrderModel } from '@/model/order';
import { ItemModel } from '@/model/item';
import { ORDER_AMOUNT_THRESHOLDS } from '@/config';

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
                            in: { item: '$$i.item', status: '$$i.status' },
                        },
                    },
                },
            },
        ]);

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
        await requireActiveSystem();

        const body = (await req.json()) as {
            items: Record<string, { _id: string; size: number }[]>;
            name?: string;
            comment?: string;
            timeslot: string;
        };

        const flatItems = Object.values(body.items ?? {}).flat();
        if (flatItems.length === 0) {
            return NextResponse.json(
                { message: 'At least one item is required' },
                { status: 400 },
            );
        }

        const newSize = flatItems.reduce((acc, i) => acc + i.size, 0);
        if (newSize > ORDER_AMOUNT_THRESHOLDS.MAX) {
            return NextResponse.json(
                { message: 'Too many items for one order' },
                { status: 400 },
            );
        }

        const session = await mongoose.startSession();
        try {
            let responseDoc: unknown;
            const itemIds = [
                ...new Set(flatItems.map((i) => i._id)),
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
                                    total: { $sum: '$items.item.size' },
                                },
                            },
                        ],
                    },
                },
            ]).session(session);

            /* validate items really exist */
            const existingItems = await ItemModel.find({ _id: { $in: itemIds } })
                .select('_id price size')
                .lean()
                .session(session);

            if (existingItems.length !== itemIds.length) {
                throw new Error('Invalid item ids provided');
            }

            const alreadyBooked = capacity?.[0]?.total ?? 0;
            if (
                alreadyBooked + newSize >
                ORDER_AMOUNT_THRESHOLDS.MAX
            ) {
                throw new Error(
                    'The time slot is already full. Please choose another one.',
                );
            }

            /* price calculation */
            const priceMap = existingItems.reduce<Record<string, number>>(
                (map, it) => {
                    map[it._id.toString()] = it.price;
                    return map;
                },
                {},
            );

            const totalPrice = flatItems.reduce(
                (sum, i) => sum + (priceMap[i._id] ?? 0),
                0,
            );

            /* build and save the order */
            responseDoc = await new OrderModel({
                name: (body.name ?? 'anonymous').slice(0, 30),
                comment: (body.comment ?? 'No comment').slice(0, 500),
                items: flatItems.map((i) => ({
                    item: i,
                    status: ITEM_STATUS_VALUES[0],
                })),
                timeslot: body.timeslot,
                totalPrice,
            }).save({ session });

            return NextResponse.json(responseDoc);
        } catch (err: any) {
            console.error('POST /order error ➜', err);
            return NextResponse.json(
                { message: err.message ?? 'There was an error on our side' },
                { status: 400 },
            );
        } finally {
            session.endSession();
        }
    }).catch((err) => {
        console.error('POST outer error ➜', err);
        return NextResponse.json(
            { message: 'There was an error on our side' },
            { status: 500 },
        );
    });
}

export async function PUT(req: Request) {
    return withDB(async () => {
        await requireAuth();

        const { id, order } = await req.json();

        if (!id || !Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: 'Invalid order ID' },
                { status: 400 },
            );
        }

        const existing = await OrderModel.findById(id);
        if (!existing) {
            return NextResponse.json(
                { message: 'Order not found' },
                { status: 404 },
            );
        }

        Object.assign(existing, {
            name: order.name,
            comment: order.comment,
            items: order.items,
            timeslot: order.timeslot,
            totalPrice: order.totalPrice,
            status: order.status,
            isPaid: order.isPaid,
            finishedAt: order.finishedAt,
        });

        await existing.save();

        return NextResponse.json(existing);
    }).catch((err) => {
        console.error('PUT /order error ➜', err);
        return NextResponse.json(
            { message: 'There was an error on our side' },
            { status: 500 },
        );
    });
}
