import dbConnect from "@/lib/dbConnect";
import { CONSTANTS } from '@/config';
import { OrderModel } from '@/model/order';

import {
    format,
    subMinutes,
    addMinutes,
    setSeconds,
    setMilliseconds,
    isAfter,
    isBefore
} from 'date-fns';
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

    // Get current time and align to slot boundaries
    const now = new Date();
    let currentTime = subMinutes(now, 5 * TIME_SLOT_SIZE_MINUTES);
    currentTime = subMinutes(currentTime, currentTime.getMinutes() % TIME_SLOT_SIZE_MINUTES);
    currentTime = setSeconds(setMilliseconds(currentTime, 0), 0);

    for (let i = -5; i < 15; i++) {
        const startTime = currentTime;
        const stopTime = addMinutes(currentTime, TIME_SLOT_SIZE_MINUTES);

        timeSlots.push({
            time: format(currentTime, 'HH:mm'),
            startTime: startTime,
            stopTime: stopTime
        });

        currentTime = addMinutes(currentTime, TIME_SLOT_SIZE_MINUTES);
    }

    const orders = await OrderModel.find({
        orderDate: {
            $gte: subMinutes(now, 10 * TIME_SLOT_SIZE_MINUTES),
            $lt: addMinutes(now, 20 * TIME_SLOT_SIZE_MINUTES),
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
            if ((isAfter(timeSlot, startTime) || timeSlot.getTime() === startTime.getTime()) &&
                isBefore(timeSlot, stopTime)) {
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
