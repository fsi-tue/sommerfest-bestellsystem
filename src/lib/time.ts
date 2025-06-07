import { setHours, setMilliseconds, setMinutes, setSeconds } from "date-fns";

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
export const getDateFromTimeSlot = (timeslot: string): Date => {
    if (!timeslot) {
        return new Date();
    }

    const [hour, minute] = timeslot.split(':');
    const now = new Date();

    return setMilliseconds(
        setSeconds(
            setMinutes(
                setHours(now, Number(hour)),
                Number(minute)
            ),
            0
        ),
        0
    );
}
