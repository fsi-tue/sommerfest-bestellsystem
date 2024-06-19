import { MAX_PIZZAS, Order } from "../../model/order";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import moment from "moment";
import { constants } from "../../config/config";


async function timeline(req: Request, res: Response) {
    
    const AMOUNT_WARNING = 8;
    const AMOUNT_CRITICAL = 10;
    const COLOR_OK = '#0ce504';
    const COLOR_WARN = '#e59604';
    const COLOR_CRIT = '#B33';

    const TIME_SLOT_SIZE_MINUTES = 5;
    const timeSlots = [];
    let currentTime = moment().tz(constants.TIMEZONE_ORDERS).subtract(5 * TIME_SLOT_SIZE_MINUTES, 'minutes').subtract(moment().minutes() % TIME_SLOT_SIZE_MINUTES,"minutes");

    for (let i = -5; i < 15; i++) {
        timeSlots.push({
            time: currentTime.format('HH:mm'),
            startTime: currentTime.toDate(),
            stopTime: moment(currentTime).add(TIME_SLOT_SIZE_MINUTES, 'minutes').toDate(),
        });
        currentTime = moment(currentTime).add(TIME_SLOT_SIZE_MINUTES, 'minutes');
    }

    const orders = await Order.find({
        orderDate: {
            $gte: moment().utc().subtract(10 * TIME_SLOT_SIZE_MINUTES, 'minutes'),
            $lt: moment().utc().add(20 * TIME_SLOT_SIZE_MINUTES, 'minutes'),
        },
    });

    const heights = timeSlots.map((timeSlot, index) => 
        orders.filter(
            order => order.orderDate >= timeSlot.startTime && order.orderDate <= timeSlot.stopTime
        ).map(order => order.pizzas.length).reduce( (a,b) => a+b, 0));

    res.send(timeSlots.map((timeSlot, index) => ({
        time: timeSlot.time,
        height: heights[index],
        color: heights[index] > AMOUNT_CRITICAL ? COLOR_CRIT : (heights[index] > AMOUNT_WARNING ? COLOR_WARN : COLOR_OK),
        border: index === 5 ? '#000' : '#FFF',
        borderwidth: index === 5 ? 4 : 0,
    })));
}

export default {timeline};
