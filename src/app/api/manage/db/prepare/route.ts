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
        { name: 'Salami halb', price: 4, type: 'pizza' },
        { name: 'Salami ganz', price: 8, type: 'pizza' },
        { name: 'Schinken Pilze halb', price: 4, type: 'pizza' },
        { name: 'Schinken Pilze ganz', price: 8, type: 'pizza' },
        { name: 'Capriccosa halb', price: 4, type: 'pizza' },
        { name: 'Capriccosa ganz', price: 8, type: 'pizza' },
        { name: 'Margherita halb', price: 3, type: 'pizza' },
        { name: 'Margherita ganz', price: 6, type: 'pizza' },
        { name: 'Capriccosa vegi halb', price: 3, dietary: 'vegetarian', type: 'pizza' },
        { name: 'Capriccosa vegi ganz', price: 6, dietary: 'vegetarian', type: 'pizza' },
        { name: 'Gemüse halb', price: 3, dietary: 'vegetarian', type: 'pizza' },
        { name: 'Gemüse ganz', price: 6, dietary: 'vegetarian', type: 'pizza' },
        { name: 'Margherita vegan halb', price: 3, dietary: 'vegan', type: 'pizza' },
        { name: 'Margherita vegan ganz', price: 6, dietary: 'vegan', type: 'pizza' },
        { name: 'Capriccosa vegan halb', price: 3, dietary: 'vegan', type: 'pizza' },
        { name: 'Capriccosa vegan ganz', price: 6, dietary: 'vegan', type: 'pizza' },
    ];
    for (const pizza of pizzas) {
        await new Food(pizza).save();
    }

    // Add the system
    const system = new System({ name: constants.SYSTEM_NAME, status: 'active' })
    await system.save()

    return Response.json({ message: 'Successfully filled database' })
}
