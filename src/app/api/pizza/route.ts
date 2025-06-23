// api/pizza

import { ItemModel } from "@/model/item";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/auth/serverAuth";
import { NextResponse } from "next/server";


const dbReady = dbConnect();

const withDB = async <T>(fn: () => Promise<T>) => {
    await dbReady;
    return fn();
};

export async function GET(request: Request) {
    return withDB(async () => {
        const pizzas = await ItemModel.find({ type: 'pizza' }).lean();
        return NextResponse.json(pizzas);
    }).catch((err) => {
        console.error('GET /order error ➜', err);
        return NextResponse.json(
            { message: 'There was an error on our side' },
            { status: 500 },
        );
    })
}

export async function POST(request: Request) {
    return withDB(async () => {
        await requireAuth();
        const newPizza = await request.json()
        const pizza = new ItemModel(newPizza);
        await pizza.save();
        return NextResponse.json(pizza);
    }).catch((err) => {
        console.error('Error creating pizza:', err);
        return NextResponse.json(
            { message: 'There was an error on our side' },
            { status: 500 },
        );
    })
}

export async function PUT(request: Request) {
    return withDB(async () => {
        await requireAuth();
        const item = await request.json()
        const updatedItem = await ItemModel.findById(item._id);
        if (!updatedItem) {
            return NextResponse.json({
                message: 'Pizza not found'
            }, { status: 404 });
        }

        updatedItem.set(item);
        await updatedItem.save();
        return Response.json(updatedItem);
    }).catch((err) => {
        console.error('Error updating pizza:', err);
        return NextResponse.json({
            message: 'Error updating pizza'
        }, { status: 500 });
    })
}
