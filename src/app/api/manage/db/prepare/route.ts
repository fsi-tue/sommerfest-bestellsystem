// Fill the database
import { FoodModel } from "@/model/food";
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { System } from "@/model/system";
import { constants } from "@/config";
import { NextResponse } from "next/server";

// Thanks to https://medium.com/phantom3/next-js-14-build-prerender-error-fix-f3c51de2fe1d
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const pizzasByName = {
    Salami: ["Cheese 🧀", "Tomato Sauce 🍅", "Salami 🍕"],
    "Ham and mushrooms": ["Cheese 🧀", "Tomato Sauce 🍅", "Ham 🥓", "Mushrooms 🍄"],
    Capriccosa: ["Cheese 🧀", "Tomato Sauce 🍅", "Mushrooms 🍄", "Artichokes 🌱", "Olives 🫒", "Ham 🥓", "Basil 🌿"],
    Margherita: ["Cheese 🧀", "Tomato Sauce 🍅", "Basil 🌿"],
    Veggies: ["Cheese 🧀", "Tomato Sauce 🍅", "Mushrooms 🍄", "Onions 🧅", "Green Peppers 🫑", "Olives 🫒"],
    "Margherita vegan": ["Vegan Cheese 🧀", "Tomato Sauce 🍅", "Basil 🌿"],
    "Capriccosa vegan": ["Vegan Cheese 🧀", "Tomato Sauce 🍅", "Mushrooms 🍄", "Artichokes 🌱", "Olives 🫒", "Basil 🌿"]
};

/**
 * Fill the database
 * @constructor
 */
export async function POST() {
    await dbConnect()

    // Authenticate the user
    const headersList = headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return NextResponse.json({
            message: 'Unauthorized'
        }, { status: 401 });
    }

    // Add pizzas
    const pizzas = [
        {
            name: 'Salami full',
            price: 8,
            dietary: 'meat',
            type: 'pizza',
            ingredients: pizzasByName['Salami'],
            size: 1
        },
        {
            name: 'Ham and mushrooms full',
            price: 8,
            dietary: 'meat',
            type: 'pizza',
            ingredients: pizzasByName['Ham and mushrooms'],
            size: 1
        },
        {
            name: 'Capriccosa full',
            price: 8,
            type: 'pizza',
            dietary: 'meat',
            ingredients: pizzasByName['Capriccosa'],
            size: 1
        },
        { name: 'Margherita full', price: 6, type: 'pizza', ingredients: pizzasByName['Margherita'], size: 1 },
        { name: 'Veggies full', price: 6, type: 'pizza', ingredients: pizzasByName['Veggies'], size: 1 },
        {
            name: 'Margherita vegan full',
            price: 6,
            dietary: 'vegan',
            type: 'pizza',
            ingredients: pizzasByName['Margherita vegan'],
            size: 1
        },
        {
            name: 'Capriccosa vegan full',
            price: 6,
            dietary: 'vegan',
            type: 'pizza',
            ingredients: pizzasByName['Capriccosa vegan'],
            size: 1
        },
    ];
    for (const pizza of pizzas) {
        await new FoodModel(pizza).save();
    }

    // Add the system
    const system = new System({ name: constants.SYSTEM_NAME, status: 'active' })
    await system.save()

    return Response.json({ message: 'Successfully filled database' })
}
