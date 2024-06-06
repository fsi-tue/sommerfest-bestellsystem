import {db} from '../db';

const invalidElements = (item: any): boolean => item !== null && item !== undefined && !(Array.isArray(item) && item.length === 0);

interface Pizza {
    id: number;
    name: string;
    enabled: boolean;
}

/**
 * Get all pizzas
 *
 * @param params - Object containing filter, limit, offset, and order parameters
 * @returns An object containing the rows and the count
 */
export async function get({filter, limit, offset, order}): Promise<{ rows: Pizza[], count: number }> {
    const pizzas = await db.query.pizza.findMany({
        where: (pizza, {eq}) => (eq(pizza.enabled, true)),
    });
    const count = pizzas.length;
    return {rows: pizzas, count};
}

interface Body {
    [key: string]: any;
}

/**
 * Not supported!
 *
 * @param body - Object containing the pizza details
 * @returns An object containing the rows and the count
 */
export async function create(body: Body): Promise<{ rows: Pizza[], count: number }> {
    throw new Error('Not supported!');
}

/**
 * Not supported!
 *
 * @param id - ID of the pizza to update
 * @param body - Object containing the updated pizza details
 * @returns An object containing the rows and the count
 */
export async function update(id: number, body: Body): Promise<{ rows: Pizza[], count: number }> {
    throw new Error('Not supported!');
}

/**
 * Not supported!
 *
 * @param id - ID of the pizza to delete
 * @returns An object containing the rows and the count
 */
export async function destroy(id: number): Promise<{ rows: Pizza[], count: number }> {
    throw new Error('Not supported!');
}
