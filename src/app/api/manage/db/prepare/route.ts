// Fill the database
import { Food } from "@/model/food";
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { System } from "@/model/system";
import {constants} from "@/config";

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
        { name: 'Pepperoni half', price: 3, dietary: 'halal', type: 'pizza', size: 0.5 },
        { name: 'Pepperoni whole', price: 6, dietary: 'halal', type: 'pizza', size: 1 },
        { name: 'Meat half', price: 4, dietary: 'halal', type: 'pizza', size: 0.5 },
        { name: 'Meat whole', price: 8, dietary: 'halal', type: 'pizza', size: 1 },
        { name: 'Capriccosa half', price: 4, dietary: 'halal', type: 'pizza', size: 0.5 },
        { name: 'Capriccosa whole', price: 8, dietary: 'halal', type: 'pizza', size: 1 },
        { name: 'Margherita half', price: 3, dietary: 'vegetarian', type: 'pizza', size: 0.5 },
        { name: 'Margherita whole', price: 6, dietary: 'vegetarian', type: 'pizza', size: 1 },
        { name: 'Capriccosa half', price: 3, dietary: 'vegetarian', type: 'pizza', size: 0.5 },
        { name: 'Capriccosa whole', price: 6, dietary: 'vegetarian', type: 'pizza', size: 1 },
        { name: 'Veggies half', price: 3, dietary: 'vegetarian', type: 'pizza', size: 0.5 },
        { name: 'Veggies whole', price: 6, dietary: 'vegetarian', type: 'pizza', size: 1 },
        { name: 'Margherita half', price: 3, dietary: 'vegan', type: 'pizza', size: 0.5 },
        { name: 'Margherita whole', price: 6, dietary: 'vegan', type: 'pizza', size: 1 },
        { name: 'Capriccosa half', price: 4, dietary: 'vegan', type: 'pizza', size: 0.5 },
        { name: 'Capriccosa whole', price: 8, dietary: 'vegan', type: 'pizza', size: 1 },
    ];
    for (const pizza of pizzas) {
        await new Food(pizza).save();
    }

    // Add the system
    const system = new System({ name: constants.SYSTEM_NAME, status: 'active' })
    await system.save()

    return Response.json({ message: 'Successfully filled database' })
}
