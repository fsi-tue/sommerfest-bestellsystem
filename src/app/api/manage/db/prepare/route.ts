// Fill the database
import { Food } from "@/model/food";
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { System } from "@/model/system";
import { constants } from "@/config";
import { NextResponse } from "next/server";

// Thanks to https://medium.com/phantom3/next-js-14-build-prerender-error-fix-f3c51de2fe1d
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const pizzas = [
    { name: "Salami", ingredients: ["Cheese 🧀", "Tomato Sauce 🍅", "Salami 🍕"] },
    { name: "Ham and mushrooms", ingredients: ["Cheese 🧀", "Tomato Sauce 🍅", "Ham 🥓", "Mushrooms 🍄"] },
    {
        name: "Capriccosa",
        ingredients: ["Cheese 🧀", "Tomato Sauce 🍅", "Mushrooms 🍄", "Artichokes 🌱", "Olives 🫒", "Ham 🥓", "Basil 🌿"]
    },
    { name: "Margherita", ingredients: ["Cheese 🧀", "Tomato Sauce 🍅", "Basil 🌿"] },
    {
        name: "Veggies",
        ingredients: ["Cheese 🧀", "Tomato Sauce 🍅", "Mushrooms 🍄", "Onions 🧅", "Green Peppers 🫑", "Olives 🫒"]
    },
    { name: "Margherita vegan", ingredients: ["Vegan Cheese 🧀", "Tomato Sauce 🍅", "Basil 🌿"] },
    {
        name: "Capriccosa vegan",
        ingredients: ["Vegan Cheese 🧀", "Tomato Sauce 🍅", "Mushrooms 🍄", "Artichokes 🌱", "Olives 🫒", "Basil 🌿"]
    }
];

const pizza_by_name = (pizza_name: string) => {
    return pizzas.filter(pizza => pizza.name == pizza_name).map(pizza => pizza.ingredients).flat();
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
            name: 'Salami half',
            price: 4,
            dietary: 'meat',
            type: 'pizza',
            ingredients: pizza_by_name('Salami'),
            size: 0.5
        },
        {
            name: 'Salami full',
            price: 8,
            dietary: 'meat',
            type: 'pizza',
            ingredients: pizza_by_name('Salami'),
            size: 1
        },
        {
            name: 'Ham and mushrooms half',
            price: 4,
            dietary: 'meat',
            type: 'pizza',
            ingredients: pizza_by_name('Ham and mushrooms'),
            size: 0.5
        },
        {
            name: 'Ham and mushrooms full',
            price: 8,
            dietary: 'meat',
            type: 'pizza',
            ingredients: pizza_by_name('Ham and mushrooms'),
            size: 1
        },
        {
            name: 'Capriccosa half',
            price: 4,
            type: 'pizza',
            dietary: 'meat',
            ingredients: pizza_by_name('Capriccosa'),
            size: 0.5
        },
        {
            name: 'Capriccosa full',
            price: 8,
            type: 'pizza',
            dietary: 'meat',
            ingredients: pizza_by_name('Capriccosa'),
            size: 1
        },
        { name: 'Margherita half', price: 3, type: 'pizza', ingredients: pizza_by_name('Margherita'), size: 0.5 },
        { name: 'Margherita full', price: 6, type: 'pizza', ingredients: pizza_by_name('Margherita'), size: 1 },
        { name: 'Veggies half', price: 3, type: 'pizza', ingredients: pizza_by_name('Veggies'), size: 0.5 },
        { name: 'Veggies full', price: 6, type: 'pizza', ingredients: pizza_by_name('Veggies'), size: 1 },
        {
            name: 'Margherita vegan half',
            price: 3,
            dietary: 'vegan',
            type: 'pizza',
            ingredients: pizza_by_name('Margherita vegan'),
            size: 0.5
        },
        {
            name: 'Margherita vegan full',
            price: 6,
            dietary: 'vegan',
            type: 'pizza',
            ingredients: pizza_by_name('Margherita vegan'),
            size: 1
        },
        {
            name: 'Capriccosa vegan half',
            price: 3,
            dietary: 'vegan',
            type: 'pizza',
            ingredients: pizza_by_name('Capriccosa vegan'),
            size: 0.5
        },
        {
            name: 'Capriccosa vegan full',
            price: 6,
            dietary: 'vegan',
            type: 'pizza',
            ingredients: pizza_by_name('Capriccosa vegan'),
            size: 1
        },
    ];
    for (const pizza of pizzas) {
        await new Food(pizza).save();
    }

    // Add the system
    const system = new System({ name: constants.SYSTEM_NAME, status: 'active' })
    await system.save()

    return Response.json({ message: 'Successfully filled database' })
}
