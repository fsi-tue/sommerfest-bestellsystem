// api/order/[id]

import dbConnect from "@/lib/dbConnect";
import { OrderModel } from "@/model/order";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "bson";


const dbReady = dbConnect();

const withDB = async <T>(fn: () => Promise<T>) => {
    await dbReady;
    return fn();
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    return withDB(async () => {

        // Get the ID from the URL
        const { id } = await params

        // Check if the ID is valid and ObjectId
        if (!id || !ObjectId.isValid(id)) {
            return new Response(`ID not valid`, { status: 400 });
        }

        // Find the order by ID
        const order = await OrderModel.findById(id)
            .select("_id items orderDate timeslot totalPrice isPaid status")
            .lean();
        if (!order) {
            return new Response(`Order not found. It might have been deleted.`, { status: 404 });
        }

        // Send the order
        return NextResponse.json(order);
    });
}
