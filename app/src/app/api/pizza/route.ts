import { Pizza } from "@/model/pizza";
import dbConnect from "@/db/dbConnect";


export async function GET() {
    await dbConnect();
    console.log('GET pizzas')

    try {
        const pizzas = await Pizza.find()
        return Response.json(pizzas)
    } catch (error) {
        console.error('Error fetching pizzas:', error);
    }

    return new Response('Error fetching pizzas', { status: 500 });
}

export async function POST(req: Request) {
    // await checkAuth(req);
    await dbConnect();

    const { body } = await req.json()

    try {
        const pizza = new Pizza(body);
        await pizza.save();
        return Response.json(pizza);
    } catch (error) {
        console.error('Error creating pizza:', error);
        return new Response('Error creating pizza', { status: 500 });
    }
}

export async function PUT(req: Request) {
    // await checkAuth(req);
    await dbConnect();

    const { pizza } = await req.json()

    try {
        const updatedPizza = await Pizza.findById(pizza._id);
        if (!updatedPizza) {
            return new Response('Pizza not found', { status: 404 });
        }

        updatedPizza.set(pizza);
        await updatedPizza.save();
        return Response.json(updatedPizza);
    } catch (error) {
        console.error('Error updating pizza:', error);
        return new Response('Error updating pizza', { status: 500 });
    }
}
