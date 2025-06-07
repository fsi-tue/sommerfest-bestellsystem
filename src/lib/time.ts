import moment from "moment-timezone";
import { CONSTANTS } from "@/config";
import { Moment } from "moment";

/**
 * Get the current time slot
 * @param {Date} date
 */
export const formatDateTime = (date: Date) => {
    if (!date) {
        return ''
    }

    const options: any = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false // "AM/PM"
    };

    return date.toLocaleString('de-DE', options);
};

/**
 * Get the current time slot
 * @param timeslot
 */
export const getDateFromTimeSlot = (timeslot: string): Moment => {
    if (!timeslot) {
        return moment().tz(CONSTANTS.TIMEZONE_ORDERS);
    }

    const [hour, minute] = timeslot.split(':');
    return moment().tz(CONSTANTS.TIMEZONE_ORDERS).set({
        hour: Number(hour),
        minute: Number(minute),
        second: 0,
        millisecond: 0
    });
}
