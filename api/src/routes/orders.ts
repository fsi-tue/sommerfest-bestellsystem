import { MAX_PIZZAS, Order } from "../../model/order";
import { Pizza } from "../../model/pizza";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";


/**
 * Get all orders
 */
async function getAll(req: Request, res: Response) {
    const orders = await Order.find();

    // Add the pizzas to the orders
    for (const order of orders) {
        order.pizzas = await Pizza.find({ _id: { $in: order.pizzas } });
    }

    res.send(orders);
}

/**
 * Get order by ID
 * /orders/:id
 *
 * @param req
 * @param res
 * @param next
 */
async function getById(req: Request, res: Response, next: NextFunction) {
    // Check if the request was GET
    if (req.method !== 'GET') {
        next();
        return;
    }

    // Get the ID from the URL
    const id = req.params.id;

    // Check if the ID is valid and ObjectId
    if (!id || !mongoose.isValidObjectId(id)) {
        res.status(400).send(`
            The ID is not valid.
            Please provide a valid ID.
            We can't find anything with this ID.
            Don't you know how to copy and paste?
            Seek help from someone who knows how to copy and paste.
        `);
        return;
    }

    // Find the order by ID
    const order = await Order.findById(id);
    if (!order) {
        res.status(404).send(`
            The order with the ID ${id} was not found.
            Are you sure you copied the right ID?
            Stop making up IDs and try again.
        `)
        return;
    }

    // Check if the order is paid
    if (order.status === 'paid') {
        res.status(400).send(`
            The order with the ID ${id} is already paid.
            You can't pay for it again.
            Stop trying to pay for the same order twice.
        `);
        return;
    }

    // Send the order
    res.send(order);
}

/**
 * Create a new order
 *
 * @param req
 * @param res
 */
async function create(req: Request, res: Response) {
    // Get the body of the request
    const body = req.body;
    console.log('Creating a new order', body);

    // Check if there are too many pizzas
    if (body.pizzas.length > MAX_PIZZAS || body.pizzas.length < 1) {
        console.error('Too many or too few pizzas', body.pizzas.length);
        res.status(400).send(`Too many or too few pizzas.
                                        We don't know what to do with that.
                                        Can't you just order a normal amount of pizzas?`
        );
    }

    // Check if pizzas exist
    const pizzas = await Pizza.find({ _id: { $in: body.pizzas } });
    if (pizzas.length !== body.pizzas.length) {
        console.error('Some pizzas are missing', body.pizzas);
        res.status(400).send(`Some of the pizzas you ordered seem to have vanished into thin crust.
                                        Are you trying to order ghost pizzas?
                                        Let's try ordering real ones this time!`
        );
    }

    // Calculate the total price
    const totalPrice = pizzas.reduce((acc, pizz) => acc + pizz?.price, 0);


    // Create the order
    const order = new Order();
    order.name = "Zeilenschubser";
    order.pizzas = pizzas
    order.totalPrice = totalPrice;
    await order.save()

    // Get the order ID
    const orderId = order._id;

    // Send the order ID
    res.send({ orderId });
}

/**
 * Not supported!
 *
 * @returns An object containing the rows and the count
 * @param req
 * @param res
 */
async function update(req: Request, res: Response) {
    // Get the order details from the request body
    const body = req.body;

    // Get id from the request
    const id = body.id;
    const status = body.status;
    console.log('Updating order', id, status)

    if (!id || !mongoose.isValidObjectId(id)) {
        console.error('Invalid ID:', id);
        res.status(400).send('Invalid ID');
        return;
    }

    try {
        // Find the order by ID
        const foundOrder = await Order.findById(id);

        if (!foundOrder) {
            return { rows: [], count: 0 };
        }

        // Update the order status
        foundOrder.status = status;

        // Save the updated order
        await foundOrder.save();

        console.log('Order updated:', foundOrder)
        res.send(foundOrder);
    } catch (error) {
        console.error('Error setting order as paid:', error);
        res.status(500).send('Error setting order as paid');
    }
}

/**
 * Not supported!
 *
 * @param id - ID of the pizza to delete
 * @returns An object containing the rows and the count
 */
async function destroy(id: number) {
    throw new Error('Not supported!');
}

export default {
    getAll,
    getById,
    create,
    update,
    destroy,
}
