// Fill the database
import { Pizza } from "../model/pizza";
import { Order } from "../model/order";

export const fillDb = async () => {
    // Add pizzas
    const pizzas = [
        { name: 'Margherita', price: 5 },
        { name: 'Marinara', price: 6 },
        { name: 'Quattro Stagioni', price: 7 },
        { name: 'Carbonara', price: 8 },
        { name: 'Frutti di Mare', price: 9 },
        { name: 'Quattro Formaggi', price: 10 },
        { name: 'Crudo', price: 11 }
    ];
    for (const pizza of pizzas) {
        await new Pizza(pizza).save();
    }

    const pizzas_by_id: { [key: string]: any } = {};
    try {
        const pizzas = await Pizza.find()
        pizzas.forEach((pizza: any) => {
            pizzas_by_id[pizza._id.toString()] = pizza;
        });
    } catch (error) {
        console.error('Error fetching pizzas:', error);
    }

    // Add orders
    const orders = [
        {
            name: 'John Doe',
            pizzas: [1, 2, 3].map(index => Object.keys(pizzas_by_id)[index - 1]),
            totalPrice: 18,
            status: 'pending'
        },
        {
            name: 'Jane Doe',
            pizzas: [4, 5].map(index => Object.keys(pizzas_by_id)[index - 1]),
            totalPrice: 17,
            status: 'paid'
        },
        {
            name: 'Alice',
            pizzas: [6].map(index => Object.keys(pizzas_by_id)[index - 1]),
            totalPrice: 10,
            status: 'ready'
        },
        {
            name: 'Bob',
            pizzas: [7].map(index => Object.keys(pizzas_by_id)[index - 1]),
            totalPrice: 11,
            status: 'delivered'
        },
    ];
    for (const order of orders) {
        await new Order(order).save();
    }

    console.log('Database filled');
}
