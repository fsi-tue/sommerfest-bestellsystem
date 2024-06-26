// Fill the database
import { Food } from "@/model/food";
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
        { name: 'Pepperoni half', price: 3, dietary: 'halal', type: 'pizza' },
        { name: 'Pepperoni whole', price: 6, dietary: 'halal', type: 'pizza' },
        { name: 'Meat half', price: 4, dietary: 'halal', type: 'pizza' },
        { name: 'Meat whole', price: 8, dietary: 'halal', type: 'pizza' },
        { name: 'Capriccosa half', price: 4, dietary: 'halal', type: 'pizza' },
        { name: 'Capriccosa whole', price: 8, dietary: 'halal', type: 'pizza' },
        { name: 'Margherita half', price: 3, dietary: 'vegetarian', type: 'pizza' },
        { name: 'Margherita whole', price: 6, dietary: 'vegetarian', type: 'pizza' },
        { name: 'Capriccosa half', price: 3, dietary: 'vegetarian', type: 'pizza' },
        { name: 'Capriccosa whole', price: 6, dietary: 'vegetarian', type: 'pizza' },
        { name: 'Veggies half', price: 3, dietary: 'vegetarian', type: 'pizza' },
        { name: 'Veggies whole', price: 6, dietary: 'vegetarian', type: 'pizza' },
        { name: 'Margherita half', price: 3, dietary: 'vegan', type: 'pizza' },
        { name: 'Margherita whole', price: 6, dietary: 'vegan', type: 'pizza' },
        { name: 'Capriccosa half', price: 4, dietary: 'vegan', type: 'pizza' },
        { name: 'Capriccosa whole', price: 8, dietary: 'vegan', type: 'pizza' },
    ];
    for (const pizza of pizzas) {
        await new Food(pizza).save();
    }

    return Response.json({ message: 'Successfully filled database' })
}
