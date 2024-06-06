import {PizzaType} from '../../model/pizza';

const invalidElements = (item: any): boolean => item !== null && item !== undefined && !(Array.isArray(item) && item.length === 0);

/**
 * Get all pizzas
 *
 * @param params - Object containing filter, limit, offset, and order parameters
 * @returns An object containing the rows and the count
 */
export async function get({filter, limit, offset, order}) {// Adjust the path as necessary
    try {
        const pizzas = await Pizza.find(filter)
        return {rows: pizzas, count: pizzas.length}
    } catch (error) {
        console.error('Error fetching pizzas:', error);
    }
    return {rows: [], count: 0};
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
export async function create(body: Body) {
    throw new Error('Not supported!');
}

/**
 * Not supported!
 *
 * @param id - ID of the pizza to update
 * @param body - Object containing the updated pizza details
 * @returns An object containing the rows and the count
 */
export async function update(id: number, body: Body) {
    throw new Error('Not supported!');
}

/**
 * Not supported!
 *
 * @param id - ID of the pizza to delete
 * @returns An object containing the rows and the count
 */
export async function destroy(id: number) {
    throw new Error('Not supported!');
}
