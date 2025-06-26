// app/api/deliver/route.ts
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { ORDER_STATUSES, OrderModel } from '@/model/order'; // [[13]]
import { ItemTicketModel, TICKET_STATUS } from '@/model/ticket';
import dbConnect from "@/lib/db";

const dbReady = dbConnect();

const withDB = async <T>(fn: () => Promise<T>) => {
    await dbReady;
    return fn();
};


export async function POST(req: Request) {
    return withDB(async () => {
            const { id } = await req.json();

            if (!id || !Types.ObjectId.isValid(id)) {
                return NextResponse.json({ message: 'Invalid order ID' }, { status: 400 });
            }

            const order = await OrderModel.findById(id);
            if (!order) {
                return NextResponse.json({ message: 'Order not found' }, { status: 404 });
            }

            if (
                order.status !== ORDER_STATUSES.COMPLETED &&
                order.status !== ORDER_STATUSES.CANCELLED
            ) {
                return NextResponse.json(
                    { message: 'Order is not completed or cancelled' },
                    { status: 400 }
                );
            }

            // Mark all associated tickets as ready
            await ItemTicketModel.updateMany(
                { orderId: order._id },
                {
                    status: TICKET_STATUS.READY,
                }
            );

            /* 1.7. Complete the order */
            order.status = ORDER_STATUSES.ACTIVE;
            order.finishedAt = undefined;
            await order.save();

            const refreshed = await OrderModel.findById(id);
            return NextResponse.json(refreshed);
        }
    );
}
