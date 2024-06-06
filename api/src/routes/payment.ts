import { eq, isNull } from "drizzle-orm";
import { open_order, paid_order, payment } from "../../db/schema";
import { db } from "../db";
import { validateBearer } from "../middleware/auth_bearer";
import moment from 'moment';
import { Request, Response } from 'express';


export async function get({ filter, limit, offset, order }) {
    return await create(filter);
}

export async function create(body) {
    let rows = []
    //TODO: require rights instead of bearer
    // return validateBearer(req, res, reqFunc);
    body = body || { id: 0 };
    const id = parseInt(body.id || "0", 10);
    //we add a payment
    const found_order = await db.query.open_order.findFirst({
        where: (order, { eq }) =>
            eq(order.id, id),
    });
    if (!found_order)
        return { rows: rows, count: rows.length };

    let paid_order_id = found_order.paidorder;
    if (paid_order_id == null) {
        // console.log("did not find a payment");
        const payment_result = await db.insert(payment).values({
        }).returning();
        const paid_order_result = await db.insert(paid_order).values({
            paymentid: payment_result[0]?.id,
        }).returning();
        paid_order_id = paid_order_result[0]?.id;
        await db.update(open_order)
            .set({ paidorder: paid_order_id })
            .where(eq(open_order.id, id));
    }
    const result = await db.query.paid_order.findFirst({
        where: (order, { eq }) => eq(order.id, paid_order_id),
    });
    if (result != null) {
        const timestamp = moment(result.timestamp);
        return {
            rows: [{
                payment_orderid: paid_order_id,
                on_unix: timestamp.unix(),
                on: timestamp.format("LLLL"),
                since: moment().subtract(timestamp).format("HH:MM:ss"),
            }], count: 1
        };
    }
    return { rows: rows, count: rows.length };
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

