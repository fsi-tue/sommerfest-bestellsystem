import { eq, isNull } from "drizzle-orm";
import { open_order, paid_order, payment } from "../../db/schema";
import { db } from "../db";
import { validateBearer } from "../middleware/auth_bearer";
import moment from 'moment';
import { Request, Response } from 'express';

// api endpoint is create a /payment/id

function index(req: Request, res: Response) {
    //show all that ...?
    // return db.query.paid_order.findFirst().then(() => { });
    return res.status(404).send("sorry, not showing all payments");
}
function range(req: Request, res: Response, a: number, b: number, format: string) {
    return res.status(404).end();//no.
}
function show(req: Request, res: Response, id: number) {
    const reqFunc = async () => {
        //we add a payment
        const found_order = await db.query.open_order.findFirst({
            where: (order, { eq }) =>
                eq(order.id, id),
        });
        if (found_order) {
            if (found_order.paidorder == null) {
                const payment_result = await db.insert(payment).values({
                }).returning();
                const paid_order_result = await db.insert(paid_order).values({
                    paymentid: payment_result[0]?.id,
                }).returning();
                const paid_order_id = paid_order_result[0]?.id;
                await db.update(open_order)
                    .set({ paidorder: paid_order_id })
                    .where(eq(open_order.id, id));
                return res.send({ paid_order_id: paid_order_id }).end();
            } else {
                const paid_order_id = found_order.paidorder;
                if (paid_order_id !== null) {
                    const result = await db.query.paid_order.findFirst({
                        where: (order, { eq }) => eq(order.id, paid_order_id),
                    });
                    if (result != null) {
                        const timestamp = moment(result.timestamp);
                        return res.send({
                            payment_orderid: paid_order_id,
                            on_unix: timestamp.unix(),
                            on: timestamp.format("LLLL"),
                            since: moment().subtract(timestamp).format("HH:MM:ss"),
                        });
                    }
                }
                return res.status(404).send(`there is a paid order, but we could not find it?`).end();
            }
        }
        return res.status(404).send(`did not find order`).end();
    };
    //TODO: require rights instead of bearer
    return validateBearer(req, res, reqFunc);
}

function destroy(req: Request, res: Response, id: number) {
    return res.status(404).end();//no.
}

function create(req: Request, res: Response) {
    //do the same like range
    const id = parseInt(req.params.id, 10);
    return show(req, res, id);
}

function replace(req: Request, res: Response, id: number) {
    res.status(404).end();// TODO: not yet
}

export default { index, range, show, destroy, create, replace };
