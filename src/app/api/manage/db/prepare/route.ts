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

export const pizzas = [
    { name: "Salami", ingredients: ["Cheese 🧀","Tomato Sauce 🍅","Salami 🍕"] },
    { name: "Ham and mushrooms", ingredients: ["Cheese 🧀","Tomato Sauce 🍅", "Ham 🥓", "Mushrooms 🍄"] },
    { name: "Capriccosa", ingredients: ["Cheese 🧀","Tomato Sauce 🍅","Mushrooms 🍄", "Artichokes 🌱", "Olives 🫒", "Ham 🥓", "Basil 🌿"] },
    { name: "Margherita", ingredients: ["Cheese 🧀","Tomato Sauce 🍅","Basil 🌿"] },
    { name: "Veggies", ingredients: ["Cheese 🧀", "Tomato Sauce 🍅", "Mushrooms 🍄", "Onions 🧅", "Green Peppers 🫑", "Olives 🫒"] },
    { name: "Margherita vegan", ingredients: ["Vegan Cheese 🧀","Tomato Sauce 🍅","Basil 🌿"] },
    { name: "Capriccosa vegan", ingredients: ["Vegan Cheese 🧀","Tomato Sauce 🍅","Mushrooms 🍄", "Artichokes 🌱", "Olives 🫒", "Basil 🌿"] }
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
        return new Response('Unauthorized', { status: 401 });
    }

    // Add pizzas
    const pizzas = [
        { name: 'Salami half', price: 4, type: 'pizza', ingredients: pizza_by_name('Salami'), },
        { name: 'Salami full', price: 8, type: 'pizza', ingredients: pizza_by_name('Salami'), },
        { name: 'Ham and mushrooms half', price: 4, type: 'pizza', ingredients: pizza_by_name('Ham and mushrooms'), },
        { name: 'Ham and mushrooms full', price: 8, type: 'pizza', ingredients: pizza_by_name('Ham and mushrooms'), },
        { name: 'Capriccosa half', price: 4, type: 'pizza', ingredients: pizza_by_name('Capriccosa'), },
        { name: 'Capriccosa full', price: 8, type: 'pizza', ingredients: pizza_by_name('Capriccosa'), },
        { name: 'Margherita half', price: 3, dietary: 'vegetarian', type: 'pizza', ingredients: pizza_by_name('Margherita'), },
        { name: 'Margherita full', price: 6, dietary: 'vegetarian', type: 'pizza', ingredients: pizza_by_name('Margherita'), },
        { name: 'Veggies half', price: 3, dietary: 'vegetarian', type: 'pizza', ingredients: pizza_by_name('Veggies'), },
        { name: 'Veggies full', price: 6, dietary: 'vegetarian', type: 'pizza', ingredients: pizza_by_name('Veggies'), },
        { name: 'Margherita vegan half', price: 3, dietary: 'vegan', type: 'pizza', ingredients: pizza_by_name('Margherita vegan'), },
        { name: 'Margherita vegan full', price: 6, dietary: 'vegan', type: 'pizza', ingredients: pizza_by_name('Margherita vegan'), },
        { name: 'Capriccosa vegan half', price: 3, dietary: 'vegan', type: 'pizza', ingredients: pizza_by_name('Capriccosa vegan'), },
        { name: 'Capriccosa vegan full', price: 6, dietary: 'vegan', type: 'pizza', ingredients: pizza_by_name('Capriccosa vegan'), },
    ];
    for (const pizza of pizzas) {
        await new Food(pizza).save();
    }
    
    // Add the system
    const system = new System({ name: constants.SYSTEM_NAME, status: 'active' })
    await system.save()

    return Response.json({ message: 'Successfully filled database' })
}
