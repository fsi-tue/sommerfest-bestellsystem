import {SQLWrapper} from 'drizzle-orm';
import {collected_order, open_order, paid_order, pizza_order_map} from '../../db/schema';
import {db} from '../db';
import {Request, Response} from 'express';

const rangeArray = (start, stop) => Array.from({length: stop - start}, (_, i) => i + start);

type CollectedOrder = {
    id: number,
    type: string,
    status: string,
    orderNumber: number,
};
type OrderIdType = {
    id: Aliased<number>,
}

async function collect_orders(...ids: number[]) {
    var orders: CollectedOrder[] = [];
    // console.log("filter", ids);
    const whereFilter = (isNullCheck: (arg: any) => SQLWrapper) => {
        if (ids.length > 0)
            return {
                where: (order, {isNull, and, inArray}) => and(isNull(isNullCheck(order)), inArray(order.id, ids))
            };
        return {
            where: (order, {isNull}) => isNull(isNullCheck(order)),
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

    // await db.query.waiting_order.findMany(whereFilter((order) => order.paidorder)).then(found_orders => (found_orders.forEach(found_order => {
    //     orders.push({
    //         id: found_order.id,
    //         type: "waiting_order",
    //     });
    // })));
    await db.query.collected_order.findMany().then(found_orders => (found_orders.forEach(found_order => {
        orders.push({
            id: found_order.id,
            type: "collected_order",
            status: "collected",
            orderNumber: found_order.id,
        });
    })));
    if (ids.length == 1 && orders.length == 1)
        return orders[0];
    return orders;
}

async function index(req: Request, res: Response) {
    //we show everything?
    const orders = await collect_orders();
    res.send(orders);
}

async function range(req: Request, res: Response, from: number, to: number, format: string) {
    const ids = rangeArray(Math.min(from, to), Math.max(from, to) + 1);
    const orderinfos = await collect_orders(...ids);
    res.send(orderinfos);
}

function show(req: Request, res: Response, id: number) {
    return range(req, res, id, id);
}

function destroy(req: Request, res: Response, id: number) {
    res.status(404).end();//no.
}

function create(req: Request, res: Response) {
    const reqFunc = () => {
        const posted_pizza_array = req.body;
        if (Array.isArray(posted_pizza_array)) { // && posted_pizza_array.every(item => typeof item === 'number')
            db.insert(open_order).values({
                name: "testname",//TODO: change 
            }).returning().then((orders) => {
                const order = orders[0];
                const orderid = order.id;
                //now we create all of the pizza entries
                const pizza_mappings = posted_pizza_array.map(pizza_element => pizza_element.id).map(pizzaid => ({
                    orderid: orderid, pizza: pizzaid,
                }));
                db.insert(pizza_order_map).values(pizza_mappings).returning().then((pizzas) => {
                    res.send({
                        orderNumber: orderid,
                        name: order.name,
                        pizzas: pizzas.map((pizz) => pizz.pizza),
                    });
                });
            });
        } else {
            //someone is testing our api?
            console.log("our api got a weird value");
            return res.status(406).end();
        }
    };
    return reqFunc();
}

function replace(req: Request, res: Response, id: number) {
    res.status(404).end();// TODO: not yet
}

export default {index, range, show, destroy, create, replace};
