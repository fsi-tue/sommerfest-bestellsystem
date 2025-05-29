import { ItemModel } from "@/model/item";
import dbConnect from "@/lib/dbConnect";
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
    await dbConnect();

    try {
        const pizzas = await ItemModel.find({ type: 'pizza' });
        return Response.json(pizzas)
    } catch (error) {
        console.error('Error fetching pizzas:', error);
    }

    return new Response('Error fetching pizzas', { status: 500 })
}

export async function POST(req: Request) {
    await dbConnect();

    // Authenticate the user
    const headersList = await headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return NextResponse.json({
            message: 'Unauthorized'
        }, { status: 401 });
    }

    const newPizza = await req.json()

    try {
        const pizza = new ItemModel(newPizza);
        await pizza.save();
        return Response.json(pizza);
    } catch (error) {
        console.error('Error creating pizza:', error);
        return new Response('Error creating pizza', { status: 500 });
    }
}

export async function PUT(req: Request) {
    await dbConnect();

    // Authenticate the user
    const headersList = await headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return NextResponse.json({
            message: 'Unauthorized'
        }, { status: 401 });
    }

    const pizza = await req.json()

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
