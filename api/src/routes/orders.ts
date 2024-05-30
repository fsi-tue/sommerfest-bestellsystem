import { open_order, pizza_order_map } from '../../db/schema';
import { db } from '../db'
import pizza from './pizza';

function index(req: Request, res: Response) {
    res.send('list all');
}
function range(req: Request, res: Response, a: int, b: int, format: string) {
    res.send('list range orders');
}
function show(req: Request, res: Response, id: int) {
    res.send('list one');
}

function destroy(req: Request, res: Response, id: int) {
    res.send('delete one');
    //no.
}

function create(req: Request, res: Response) {
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
}

export default { index, range, show, destroy, create };