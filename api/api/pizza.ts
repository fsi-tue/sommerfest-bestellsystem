import { Request, Response } from 'express';
import { Pizza } from "../model/pizza";
import { checkAuth } from "./auth";


/**
 * Get all pizzas
 * @param req
 * @param res
 */
export async function getAllPizzas(req: Request, res: Response) {
    try {
        const pizzas = await Pizza.find()
        return res.send(pizzas);
    } catch (error) {
        console.error('Error fetching pizzas:', error);
    }

    res.status(500).send('Error fetching pizzas');
}

/**
 * Create a new pizza
 * @param req
 * @param res
 */
export async function createPizza(req: Request, res: Response) {
    await checkAuth(req, res);

    const body = req.body;
    try {
        const pizza = new Pizza(body);
        await pizza.save();
        res.send(pizza);
    } catch (error) {
        console.error('Error creating pizza:', error);
        res.status(500).send('Error creating pizza');
    }
}

/**
 * Update a pizza
 * @param req
 * @param res
 */
export async function updatePizza(req: Request, res: Response) {
    await checkAuth(req, res);

    const body = req.body;
    const id = body._id;
    try {
        const pizza = await Pizza.findById(id);
        if (!pizza) {
            return res.status(404).send('Pizza not found');
        }

        pizza.set(body);
        await pizza.save();
        res.send(pizza);
    } catch (error) {
        console.error('Error updating pizza:', error);
        res.status(500).send('Error updating pizza');
    }
}
