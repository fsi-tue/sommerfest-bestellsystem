// app/api/deliver/route.ts
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { ORDER_STATUSES, OrderModel } from '@/model/order'; // [[13]]
import { ItemTicketDocument, ItemTicketDocumentWithItem, ItemTicketModel, TICKET_STATUS } from '@/model/ticket';
import dbConnect from "@/lib/db";

const dbReady = dbConnect();

const withDB = async <T>(fn: () => Promise<T>) => {
    await dbReady;
    return fn();
};


export async function POST(req: Request) {
    return withDB(async () => {
            const { id, ignoreTickets } = await req.json();
            const forceIgnore = !!ignoreTickets;

            if (!id || !Types.ObjectId.isValid(id)) {
                return NextResponse.json({ message: 'Invalid order ID' }, { status: 400 });
            }

            const order = await OrderModel.findById(id);
            if (!order) {
                return NextResponse.json({ message: 'Order not found' }, { status: 404 });
            }

            if (
                order.status === ORDER_STATUSES.COMPLETED ||
                order.status === ORDER_STATUSES.CANCELLED
            ) {
                return NextResponse.json(
                    { message: 'Order is already completed or cancelled' },
                    { status: 400 }
                );
            }

            const required = new Map<string, number>();
            order.items.forEach(item => {
                const itemTypeId = item._id.toString();
                required.set(itemTypeId, (required.get(itemTypeId) ?? 0) + 1);
            });

            try {
                const ticketsToDeliver = [] as ItemTicketDocument[];

                for (const [itemTypeId, requiredCount] of required.entries()) {
                    /* 1.1. Already assigned tickets (READY or ACTIVE) */
                    const alreadyAssigned = await ItemTicketModel.find({
                        itemTypeRef: itemTypeId,
                        orderId: order._id,
                        status: { $in: [TICKET_STATUS.READY, TICKET_STATUS.ACTIVE] }
                    }).sort({ timeslot: 1, createdAt: 1 }).limit(requiredCount)

                    const readyAssigned = alreadyAssigned.filter(
                        t => t.status === TICKET_STATUS.READY
                    );
                    const activeAssigned = alreadyAssigned.length - readyAssigned.length;

                    ticketsToDeliver.push(...readyAssigned);

                    let remaining = requiredCount - readyAssigned.length - activeAssigned;

                    /* 1.2. Pull READY, unassigned tickets if still needed */
                    if (remaining > 0) {
                        const readyUnassigned = await ItemTicketModel.find({
                            itemTypeRef: itemTypeId,
                            status: TICKET_STATUS.READY,
                            orderId: null
                        })
                            .sort({ timeslot: 1, createdAt: 1 })
                            .limit(remaining);

                        ticketsToDeliver.push(...readyUnassigned);
                        remaining -= readyUnassigned.length;
                    }

                    /* 1.1. Abort if shortage and client did not allow it */
                    if (remaining > 0 && !forceIgnore) {
                        throw new Error(
                            `Not enough ready tickets available for item type ${itemTypeId}`
                        );
                    }
                }

                /* 1.4. Final invariant */
                if (!forceIgnore && ticketsToDeliver.length !== order.items.length) {
                    throw new Error('Could not satisfy full order');
                }

                /* 1.5. Unassign all tickets of this order that are NOT going to be delivered */
                await ItemTicketModel.updateMany(
                    {
                        orderId: order._id,
                        _id: { $nin: ticketsToDeliver.map(t => t._id) }
                    },
                    { $set: { orderId: null } },
                );

                /* 1.6. Mark deliverable tickets as COMPLETED (idempotent / race-safe) */
                const updates = ticketsToDeliver.map(t =>
                    ItemTicketModel.updateOne(
                        { _id: t._id },
                        { $set: { orderId: order._id, status: TICKET_STATUS.COMPLETED } },
                    )
                );
                await Promise.all(updates);

                /* 1.7. Complete the order */
                order.status = ORDER_STATUSES.COMPLETED;
                order.finishedAt = new Date();
                await order.save();

                const refreshed = await OrderModel.findById(id);
                return NextResponse.json(refreshed);
            } catch (err: any) {

                // Domain‐level shortage error
                if (err.message?.startsWith('Not enough')) {
                    return NextResponse.json({ message: err.message }, { status: 400 });
                }
                if (err.message?.startsWith('Could not satisfy')) {
                    return NextResponse.json({ message: err.message }, { status: 409 });
                }

                // Anything else → 500
                console.error('POST /deliver error ➜', err);
                return NextResponse.json(
                    { message: 'There was an internal error' },
                    { status: 500 }
                );
            }
        }
    );
}
