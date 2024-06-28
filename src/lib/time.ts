import moment from "moment-timezone";
import { constants } from "@/config";

/**
 * Get the current time slot
 * @param {Date} date
 */
export const formatDateTime = (date: Date) => {
    if (!date) {
        return null;
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
export const getDateFromTimeSlot = (timeslot: string) => {
    if (!timeslot) {
        return moment().tz(constants.TIMEZONE_ORDERS);
    }

    const [hour, minute] = timeslot.split(':');
    return moment().tz(constants.TIMEZONE_ORDERS).set({
        hour: Number(hour),
        minute: Number(minute),
        second: 0,
        millisecond: 0
    });
}
