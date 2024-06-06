import { SQLWrapper } from 'drizzle-orm';
import { collected_order, open_order, paid_order, pizza_order_map } from '../../db/schema';
import { db } from '../db';

const rangeArray = (start, stop) => Array.from({ length: stop - start }, (_, i) => i + start);

type CollectedOrder = {
    id: number,
    type: string,
    status: string,
    orderNumber: number,
};
type OrderIdType = {
    id: Aliased<number>,
}

async function collect_orders(...ids: number[]): CollectedOrder[] {
    var orders: CollectedOrder[] = [];
    console.log("filter", ids);
    const whereFilter = (isNullCheck: (arg: any) => SQLWrapper) => {
        if (ids.length > 0)
            return {
                where: (order, { isNull, and, inArray }) => and(isNull(isNullCheck(order)), inArray(order.id, ids))
            };
        return {
            where: (order, { isNull }) => isNull(isNullCheck(order)),
        };
    };
    await db.query.open_order.findMany(whereFilter((order) => order.paidorder)).then(found_orders => (found_orders.forEach(found_order => {

        orders.push({
            id: found_order.id,
            type: "open_order",
            status: "unpaid",
            orderNumber: found_order.id,
        });
    })));
    await db.query.paid_order.findMany(whereFilter((order) => order.waitingorder)).then(found_orders => (found_orders.forEach(found_order => {

        orders.push({
            id: found_order.id,
            type: "paid_order",
            status: "paid",
            orderNumber: found_order.id,
        });
    })));

    await db.query.waiting_order.findMany(whereFilter((order) => order.collectedorder)).then(found_orders => (found_orders.forEach(found_order => {

        orders.push({
            id: found_order.id,
            type: "waiting_order",
            status: "collected",
            orderNumber: found_order.id,
        });
    })));

    await db.query.collected_order.findMany().then(found_orders => (found_orders.forEach(found_order => {

        orders.push({
            id: found_order.id,
            type: "collected_order",
            status: "collected",
            orderNumber: found_order.id,
        });
    })));
    return orders;
}

export async function get({ filter, limit, offset, order }) {
    var ids = [];
    if ("id" in filter) {
        ids.push(parseInt(filter["id"]));
    }
    // const ids = rangeArray(Math.min(from, to), Math.max(from, to) + 1);
    const rows = await collect_orders(...ids);
    const count = rows.length;
    return { rows, count };
}
export async function create(body) {
    const posted_pizza_array = body;
    if (Array.isArray(posted_pizza_array)) { // && posted_pizza_array.every(item => typeof item === 'number')
        const orders = await db.insert(open_order).values({
            name: "testname",//TODO: change 
        }).returning()
        const order = orders[0];
        const orderid = order.id;
        //now we create all of the pizza entries
        const pizza_mappings = posted_pizza_array.map(pizza_element => pizza_element.id).map(pizzaid => ({
            orderid: orderid, pizza: pizzaid,
        }));
        const pizzas = await db.insert(pizza_order_map).values(pizza_mappings).returning();
        return {
            rows: {
                orderNumber: orderid,
                name: order.name,
                pizzas: pizzas.map((pizz) => pizz.pizza),//TODO: fix
            }, count: 1
        };
    } else {
        //someone is testing our api?
        console.log("our api got a weird value");
        return {};
    }
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

