// Fill the database
import { Pizza } from "@/model/pizza";
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";

// Thanks to https://medium.com/phantom3/next-js-14-build-prerender-error-fix-f3c51de2fe1d
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


export async function POST() {
    await dbConnect()

    // Authenticate the user
    const headersList = headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Add pizzas
    const pizzas = [
        { name: 'Margherita', price: 5 },
        { name: 'Marinara', price: 6 },
        { name: 'Quattro Stagioni', price: 7 },
        { name: 'Carbonara', price: 8 },
        { name: 'Frutti di Mare', price: 9 },
        { name: 'Quattro Formaggi', price: 10 },
        { name: 'Crudo', price: 11 }
    ];
    for (const pizza of pizzas) {
        await new Pizza(pizza).save();
    }

    const pizzas_by_id: { [key: string]: any } = {};
    try {
        const pizzas = await Pizza.find()
        pizzas.forEach((pizza: any) => {
            pizzas_by_id[pizza._id.toString()] = pizza;
        });
    } catch (error) {
        console.error('Error fetching pizzas:', error);
    }

    return Response.json({ message: 'Successfully filled database' })
}
