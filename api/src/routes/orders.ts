import { open_order, paid_order, waiting_order, collected_order, pizza_order_map } from '../../db/schema';
import { db } from '../db';
import { Request, Response } from 'express';

async function index(req: Request, res: Response) {
    //we show everything?
    var orders = [];
    await db.query.open_order.findMany({
        where: (order, { isNull }) => isNull(order.paidorder),
    }).then(found_orders => (found_orders.forEach(found_order => {
        orders.push({
            id: found_order.id,
            type: "open_order",
        });
    })));
    await db.query.paid_order.findMany({
        where: (order, { isNull }) => isNull(order.waitingorder),
    }).then(found_orders => (found_orders.forEach(found_order => {
        orders.push({
            id: found_order.id,
            type: "paid_order",
        });
    })));
    await db.query.waiting_order.findMany({
        where: (order, { isNull }) => isNull(order.collectedorder),
    }).then(found_orders => (found_orders.forEach(found_order => {
        orders.push({
            id: found_order.id,
            type: "waiting_order",
        });
    })));
    await db.query.collected_order.findMany().then(found_orders => (found_orders.forEach(found_order => {
        orders.push({
            id: found_order.id,
            type: "collected_order",
        });
    })));

    res.send(orders);
}
function range(req: Request, res: Response, a: int, b: int, format: string) {
    res.send('list range orders');
}
function show(req: Request, res: Response, id: int) {
    return range(req, res, id, id);
}

function destroy(req: Request, res: Response, id: int) {
    res.status(404).end();//no.
}

function create(req: Request, res: Response) {
    const reqFunc = () => {
        const posted_pizza_array = req.body;
        if (Array.isArray(posted_pizza_array)) { // && posted_pizza_array.every(item => typeof item === 'number')
            db.insert(open_order).values({
                name: "testname",
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
        }
        else {
            //someone is testing our api?
            console.log("our api got a weird value")
        }
    };
    return reqFunc();
}

export default { index, range, show, destroy, create };