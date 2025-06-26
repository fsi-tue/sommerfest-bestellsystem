// api/order/deliver/route.ts

import { ORDER_STATUSES, OrderModel } from "@/model/order";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { ItemTicketModel, TICKET_STATUS } from "@/model/ticket";
import dbConnect from "@/lib/dbConnect";

const dbReady = dbConnect();

const withDB = async <T>(fn: () => Promise<T>) => {
    await dbReady;
    return fn();
};

export async function POST(req: Request) {
    return withDB(async () => {
        let { id, ignoreTickets } = await req.json();

        ignoreTickets ??= false;
        console.log(ignoreTickets);

        if (!id || !Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { message: 'Invalid order ID' },
                { status: 400 }
            );
        }

        // 1. Find the order by id
        const order = await OrderModel.findById(id);
        if (!order) {
            return NextResponse.json(
                { message: 'Order not found' },
                { status: 404 }
            );
        }

        if (order.status === ORDER_STATUSES.COMPLETED || order.status === ORDER_STATUSES.CANCELLED) {
            return NextResponse.json(
                { message: 'Order is already completed or cancelled' },
                { status: 400 }
            );
        }

        // 2. Get all items of order
        const requiredItems = new Map<string, number>();
        order.items.forEach(item => {
            const typeId = item._id.toString();
            requiredItems.set(typeId, (requiredItems.get(typeId) ?? 0) + 1);
        });

        // 3. Get tickets for delivery
        const ticketsToDeliver = [];

        for (const [itemTypeId, requiredCount] of requiredItems.entries()) {
            // 3.1 First get already assigned tickets for this order
            const assignedTickets = await ItemTicketModel.find({
                itemTypeRef: itemTypeId,
                orderId: order._id,
                status: TICKET_STATUS.READY
            }).sort({ timeslot: 1, createdAt: 1 });

            ticketsToDeliver.push(...assignedTickets);
            let remainingNeeded = requiredCount - assignedTickets.length;

            // 3.2 If we need more, get ready unassigned tickets
            // But we want to make sure that no tickets are in the pipeline!
            if (remainingNeeded <= 0) {
                continue;
            }
            const readyUnassignedTickets = await ItemTicketModel.find({
                itemTypeRef: itemTypeId,
                status: TICKET_STATUS.READY,
                orderId: null
            })
                .sort({ timeslot: 1, createdAt: 1 })
                .limit(remainingNeeded);
            ticketsToDeliver.push(...readyUnassignedTickets);
            remainingNeeded -= readyUnassignedTickets.length;

            if (remainingNeeded <= 0) {
                continue;
            }
            const activeTickets = await ItemTicketModel.find({
                itemTypeRef: itemTypeId,
                status: TICKET_STATUS.ACTIVE,
                orderId: null
            })
                .sort({ timeslot: 1, createdAt: 1 })
                .limit(remainingNeeded);
            ticketsToDeliver.push(...activeTickets);
            remainingNeeded -= activeTickets.length;
            if (remainingNeeded > 0 && !ignoreTickets) {
                return NextResponse.json(
                    { message: `Not enough tickets available for item type ${itemTypeId}` },
                    { status: 400 }
                );
            }
        }

        // 4. Unassign all the tickets
        await ItemTicketModel.updateMany(
            { orderId: order._id },
            {
                orderId: null
            }
        );

        // 4.1 Reassign and update all tickets
        const ticketUpdatePromises = ticketsToDeliver.map(ticket =>
            ItemTicketModel.findByIdAndUpdate(
                ticket._id,
                {
                    status: TICKET_STATUS.COMPLETED,
                    orderId: order._id
                },
                { new: true }
            )
        );

        await Promise.all(ticketUpdatePromises);

        // 5. Mark order as completed
        order.status = ORDER_STATUSES.COMPLETED;
        order.finishedAt = new Date();
        await order.save();

        return NextResponse.json(order);
    }).catch((err) => {
        console.error('POST /deliver error ➜', err);
        return NextResponse.json(
            { message: err.message ?? 'There was an error on our side' },
            { status: 500 },
        );
    });
}
