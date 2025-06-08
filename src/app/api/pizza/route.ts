import { ItemModel } from "@/model/item";
import dbConnect from "@/lib/dbConnect";
import { requireAuth } from "@/lib/serverAuth";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
    await dbConnect();

    try {
        const pizzas = await ItemModel.find({ type: 'pizza' }).lean();
        return Response.json(pizzas)
    } catch (error) {
        console.error('Error fetching pizzas:', error);
    }

    return new Response('Error fetching pizzas', { status: 500 })
}

export async function POST(request: Request) {
    await dbConnect();
    await requireAuth();

    const newPizza = await request.json()

    try {
        const pizza = new ItemModel(newPizza);
        await pizza.save();
        return Response.json(pizza);
    } catch (error) {
        console.error('Error creating pizza:', error);
        return new Response('Error creating pizza', { status: 500 });
    }
}

export async function PUT(request: Request) {
    await dbConnect();
    await requireAuth();

    const pizza = await request.json()

    try {
        const updatedPizza = await ItemModel.findById(pizza._id);
        if (!updatedPizza) {
            return NextResponse.json({
                message: 'Pizza not found'
            }, { status: 404 });
        }

        updatedPizza.set(pizza);
        await updatedPizza.save();
        return Response.json(updatedPizza);
    } catch (error) {
        console.error('Error updating pizza:', error);
        return NextResponse.json({
            message: 'Error updating pizza'
        }, { status: 500 });
    }
}
