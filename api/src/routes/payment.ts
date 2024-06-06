import mongoose from "mongoose";
import {Order} from "../../model/order";


export async function get({filter, limit, offset, order}) {
    return await create(filter);
}

export async function create(body: { id: number }) {
    const {id} = body;

    try {
        // Parse the order ID
        const orderId = mongoose.Types.ObjectId(id);

        // Find the order by ID
        const foundOrder = await Order.findById(orderId);

        if (!foundOrder) {
            return {rows: [], count: 0};
        }

        // Update the order to set it as paid and update the status
        foundOrder.status = 'paid';

        // Save the updated order
        await foundOrder.save();

        return {
            rows: [foundOrder],
            count: 1
        };
    } catch (error) {
        console.error('Error setting order as paid:', error);
        return {rows: [], count: 0, error: error.message};
    }
}

export function update(id, body) {
    throw new Error('Not supported!');
}

export function destroy(id) {
    throw new Error('Not supported!');
}
