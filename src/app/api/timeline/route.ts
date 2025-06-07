import dbConnect from "@/lib/dbConnect";
import { CONSTANTS } from '@/config';
import { OrderModel } from '@/model/order';

import moment from 'moment-timezone';
import { ItemDocument, ItemModel } from "@/model/item";
import { getDateFromTimeSlot } from "@/lib/time";

// Thanks to https://medium.com/phantom3/next-js-14-build-prerender-error-fix-f3c51de2fe1d
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(request: Request) {
    await dbConnect();

    const AMOUNT_WARNING = 3;
    const AMOUNT_CRITICAL = 5;

    const COLOR_OK = '#0ce504';
    const COLOR_WARN = '#e59604';
    const COLOR_CRIT = '#B33';

    const TIME_SLOT_SIZE_MINUTES = 10;
    const timeSlots = [];
    let currentTime = moment().tz(CONSTANTS.TIMEZONE_ORDERS)
        .subtract(5 * TIME_SLOT_SIZE_MINUTES, 'minutes')
        .subtract(moment().minutes() % TIME_SLOT_SIZE_MINUTES, "minutes")
        .set({
            second: 0,
            millisecond: 0
        });

    for (let i = -5; i < 15; i++) {
        timeSlots.push({
            time: currentTime.format('HH:mm'),
            startTime: currentTime,
            stopTime: currentTime.clone().add(TIME_SLOT_SIZE_MINUTES, 'minutes')
        });
        currentTime = moment(currentTime).add(TIME_SLOT_SIZE_MINUTES, 'minutes');
    }

    const orders = await OrderModel.find({
        orderDate: {
            $gte: moment().utc().subtract(10 * TIME_SLOT_SIZE_MINUTES, 'minutes'),
            $lt: moment().utc().add(20 * TIME_SLOT_SIZE_MINUTES, 'minutes'),
        },
        status: { $ne: 'cancelled' }, // TODO: Check if this is needed
    });
    const items = await ItemModel.find();
    const itemsById = items
        .reduce((map: { [id: string]: ItemDocument }, item) => {
            map[item._id.toString()] = item;
            return map;
        }, {});

    const orderTimeslots = timeSlots.map(({ startTime, stopTime }) => {
        let totalAmount = 0.0;
        orders.forEach(({ timeslot, items }) => {
            const timeSlot = getDateFromTimeSlot(timeslot);
            if (timeSlot >= startTime && timeSlot < stopTime) {
                items.forEach(({ item }) => {
                    totalAmount += itemsById[item._id.toString()].size;
                });
            }
        });
        return totalAmount;
    });

    return Response.json(timeSlots.map((timeSlot, index) => ({
        time: timeSlot.time,
        Orders: orderTimeslots[index],
        color: orderTimeslots[index] > AMOUNT_CRITICAL ? COLOR_CRIT : (orderTimeslots[index] > AMOUNT_WARNING ? COLOR_WARN : COLOR_OK),
        border: index === 5 ? '#000' : '#FFF',
        borderwidth: index === 5 ? 4 : 0,
    })));
}
