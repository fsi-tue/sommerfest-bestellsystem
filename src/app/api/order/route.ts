import mongoose, { ObjectId } from "mongoose";
import { Food, FoodDocument } from "@/model/food";
import dbConnect from "@/lib/dbConnect";
import { headers } from "next/headers";
import { extractBearerFromHeaders, validateToken } from "@/lib/auth";
import { Order } from "@/model/order";
import { ORDER } from "@/config";

export async function GET(req: Request) {
    await dbConnect();

    // Authenticate the user
    const headersList = headers()
    if (!await validateToken(extractBearerFromHeaders(headersList))) {
        return new Response('Unauthorized', { status: 401 });
    }

    const orders = await Order.find();
    const foods = await Food.find();

    const transformedOrders = await Promise.all(orders.map(async order => {
        // Get the foods for the order
        const foodsForOrder = foods.filter((food: any) => order.items.includes(food._id));

        // Create a map of food details
        const foodDetailsMap = foodsForOrder
            .reduce((map: { [id: string]: FoodDocument }, food: any) => {
                map[food._id.toString()] = food;
                return map;
            }, {});

        return {
            _id: order._id,
            name: order.name,
            comment: order.comment || "",
            items: order.items.map(pizzaId => foodDetailsMap[pizzaId.toString()]),
            orderDate: order.orderDate,
            totalPrice: order.totalPrice,
            finishedAt: order.finishedAt,
            status: order.status
        }
    }))

    return Response.json(transformedOrders);
}

export async function POST(req: Request) {
    await dbConnect();

    // Get the body of the request
    const { pizzas, name, comment} = await req.json();


    // Check if there are too many pizzas
    if (pizzas.length > ORDER.MAX_ITEMS || pizzas.length < 1) {
        console.error('Too many or too few pizzas', pizzas.length);
        return new Response(`Too many or too few pizzas.
                                        We don't know what to do with that.
                                        Can't you just order a normal amount of pizzas?`
        );
    }

    // Check if the pizzas are valid
    const pizzaIds: string[] = pizzas.map((pizza: { _id: string }) => pizza._id);
    if (!pizzaIds.every(async (pizzaId: string) => await Food.exists({ _id: pizzaId }))) {
        console.error('Some pizzas are missing', pizzas);
        return new Response(`Some of the pizzas you ordered seem to have vanished into thin crust.
                            Are you trying to order ghost pizzas?
                            Let's try ordering real ones this time!`, { status: 400 });
    }

    // Calculate the total price.
    // Don't trust the price from the request body
    const totalPrice: number = await pizzaIds
        .reduce(async (total: Promise<number>, pizzaId: string) => {
            const pizza = await Food.findOne({ _id: pizzaId });
            if (!pizza) {
                console.error('Pizza not found', pizzaId)
                return total;
            }
            return await total + pizza.price;
        }, Promise.resolve(0));

    // Create the order
    const order = new Order();
    order.name = (name || "anonymous").slice(0,30);
    order.items = pizzas
    order.totalPrice = totalPrice;
    order.comment = (comment || "No comment" ).slice(0,500);
    await order.save()

    // Get the order ID
    const orderId = order._id;

    // Send the order ID
    return Response.json({ orderId });
}

export async function PUT(req: Request) {
    await dbConnect();

    // Get the order details from the request body
    const { id, status } = await req.json()

    if (!id || !mongoose.isValidObjectId(id)) {
        console.error('Invalid ID:', id);
        return new Response('Invalid ID', { status: 400 });
    }


    try {
        // Find the order by ID
        const foundOrder = await Order.findById(id);

        if (!foundOrder) {
            return new Response('Order not found', { status: 404 });
        }

        // Update the order status
        foundOrder.status = status;

        // Save the updated order
        await foundOrder.save();

        // console.log('Order updated:', foundOrder)
        return Response.json(foundOrder);
    } catch (error) {
        console.error('Error setting order as paid:', error);
        return new Response('Error setting order as paid', { status: 500 });
    }
}
