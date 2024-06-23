import mongoose from "mongoose";
import { Order } from "../../model/order";
import { Request, Response } from "express";

export async function create(req: Request, res: Response) {
    // Get the order details from the request body
    const body = req.body;

    // Get id from the request
    const id = req.body.id;
    if (!id || !mongoose.isValidObjectId(id)) {
        res.status(400).send('Invalid ID');
        return;
    }

    try {
        // Find the order by ID
        const foundOrder = await Order.findById(id);

        if (!foundOrder) {
            return { rows: [], count: 0 };
        }

        // Update the order to set it as paid and update the status
        foundOrder.status = 'paid';

        // Save the updated order
        await foundOrder.save();

        res.send(foundOrder);
    } catch (error) {
        console.error('Error setting order as paid:', error);
        res.status(500).send('Error setting order as paid');
    }
}

/**
 * Not supported!
 *
 * @param id - ID of the pizza to update
 * @param body - Object containing the updated pizza details
 * @returns An object containing the rows and the count
 */
async function update(id: number, body: Body) {
    throw new Error('Not supported!');
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
    create,
    update,
    destroy,
}
