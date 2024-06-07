import { Pizza } from '../../model/pizza';
import { Request, Response } from 'express';

/**
 * Get all pizzas
 *
 * @returns An object containing the rows and the count
 * @param req
 * @param res
 */
async function getAll(req: Request, res: Response) {
    try {
        const pizzas = await Pizza.find()
        return res.send(pizzas);
    } catch (error) {
        console.error('Error fetching pizzas:', error);
    }

    res.status(500).send('Error fetching pizzas');
}

/**
 * Not supported!
 *
 * @param body - Object containing the pizza details
 * @returns An object containing the rows and the count
 */
async function create<T>(body: T) {
    throw new Error('Not supported!');
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
    getAll,
    create,
    update,
    destroy
}
