import { db } from '../db'
import { Request, Response } from 'express';

const invalid_elements = item => item !== null && item !== undefined && !(Array.isArray(item) && item.length === 0);

export async function get({ filter, limit, offset, order }) {
    const rows = db.query.pizza.findMany({
        where: (pizza, { eq }) => (eq(pizza.enabled, true)),
    });
    const count = rows.length;
    return { rows, count };
}
export function create(body) {
    const rows = [];
    const count = rows.length;
    return { rows, count };
}
export function update(id, body) {
    const rows = [];
    const count = rows.length;
    return { rows, count };
}
export function destroy(id) {
    const rows = [];
    const count = rows.length;
    // return res.status(404).end();//no.
    return { rows, count };
}
