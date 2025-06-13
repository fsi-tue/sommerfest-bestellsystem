import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/serverAuth";
import { OrderModel } from "@/model/order";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "bson";

/**
 * Retrieve whether order is paid or not
 * @constructor
 * @param request
 * @param params
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();

    // Get the ID from the URL
    const { id } = await params

    // Check if the ID is valid and ObjectId
    if (!id || !ObjectId.isValid(id)) {
        return NextResponse.json({
            message: 'The ID is not valid.'
        }, { status: 400 })
    }

    // Find the order by ID
    const order = await OrderModel.findById(id);
    if (!order) {
        return NextResponse.json({
            message: 'The Order was not found.'
        }, { status: 404 })
    }

    return Response.json({
        isPaid: order.isPaid
    })
}

/**
 * Set order as paid
 * @constructor
 * @param request
 * @param params
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // Get the ID from the URL
    const { id } = await params

    // Get the order details from the request body
    const { isPaid } = await request.json()

    // Check if the ID is valid and ObjectId
    if (!id || !ObjectId.isValid(id)) {
        return NextResponse.json({
            message: 'The ID is not valid.'
        }, { status: 400 })
    }

    await dbConnect();
    await requireAuth();


    try {
        // Find the order by ID
        const foundOrder = await OrderModel.findById(id);

        if (!foundOrder) {
            return NextResponse.json({
                message: 'The Order was not found.'
            }, { status: 404 })
        }

        // Update the order status
        foundOrder.isPaid = isPaid

        // Save the updated order
        await foundOrder.save();

        return Response.json(foundOrder);
    } catch (error) {
        console.error(`Error setting order as paid`)
        return new Response(`Error setting order as paid`, { status: 500 });
    }
}
