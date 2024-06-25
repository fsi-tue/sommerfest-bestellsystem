// Fill the database
import { Pizza } from "@/model/pizza";
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";

// Thanks to https://medium.com/phantom3/next-js-14-build-prerender-error-fix-f3c51de2fe1d
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


/**
 * Fill the database
 * @constructor
 */
export async function POST() {
    await dbConnect()

    // Authenticate the user
    const headersList = headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Add pizzas
    const pizzas = [
        { name: 'NON-VEG-Pepperoni half', price: 3 },
        { name: 'NON-VEG-Pepperoni whole', price: 6 },
        { name: 'NON-VEG-Meat half', price: 4 },
        { name: 'NON-VEG-Meat whole', price: 8 },
        { name: 'NON-VEG-Capriccosa half', price: 4 },
        { name: 'NON-VEG-Capriccosa whole', price: 8 },
        { name: 'VEGE-Margherita half', price: 3 },
        { name: 'VEGE-Margherita whole', price: 6 },
        { name: 'VEGE-Capriccosa half', price: 3 },
        { name: 'VEGE-Capriccosa whole', price: 6 },
        { name: 'VEGE-Veggies half', price: 3 },
        { name: 'VEGE-Veggies whole', price: 6 },
        { name: 'VEGAN-Margherita half', price: 3 },
        { name: 'VEGAN-Margherita whole', price: 6 },
        { name: 'VEGAN-Capriccosa half', price: 4 },
        { name: 'VEGAN-Capriccosa whole', price: 8 }
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
