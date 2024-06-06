import {Order} from "../../model/order";
import {Pizza, type PizzaType} from "../../model/pizza";

const MAX_PIZZAS = 12;

export async function get({filter, limit, offset, order}) {
    const orders = await Order.find(filter);
    return {rows: orders, count: orders.length};
}

export async function create(body: { name: string, pizzas: number[] }) {
    // Check if there are too many pizzas
    if (body.pizzas.length > MAX_PIZZAS) {
        // TODO: return a funny error message
        return {rows: [], count: 0, error: 'Too many pizzas'};
    }

    // Check if pizzas exist
    const pizzas = await Pizza.find({ _id: { $in: body.pizzas } });
    if (pizzas.length !== body.pizzas.length) {
        return { rows: [], count: 0, error: 'Some pizzas do not exist' };
    }

    // Calculate the total price
    // TODO: ugly
    const totalPrice = pizzas.reduce((acc, pizz: any) => acc + pizz?.price, 0);


    // Create the order
    const order = new Order();
    order.name = body.name;
    order.pizzas = body.pizzas
    await order.save();

    // Get id of the order
    const orderId = order._id;

    return {
        rows: {
            orderNumber: orderId,
            name: order.name,
            pizzas: pizzas.map((pizz) => pizz.pizza),//TODO: fix
        }, count: 1
    };
}

export function update(id, body) {
    const rows = [];
    const count = rows.length;
    return {rows, count};
}

export function destroy(id) {
    const rows = [];
    const count = rows.length;
    // return res.status(404).end();//no.
    return {rows, count};
}
