import { format, setHours, setMilliseconds, setMinutes, setSeconds } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { UTCDate } from "@date-fns/utc";

// Timezone of the user
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

export interface TimeSlot {
    time: string;
    startTime: Date;
    stopTime: Date;
}


/**
 * Get the current time slot
 * @param {Date} date
 */
export const formatDateTime = (date: Date, isUTC = false) => {
    if (!date) {
        return '';
    }

    const formatString = 'dd.MM.yy HH:mm';

    if (isUTC) {
        // Convert UTC date to local timezone
        return formatInTimeZone(date, Intl.DateTimeFormat().resolvedOptions().timeZone, formatString);
    } else {
        // Already in local time
        return format(date, formatString);
    }
};

/**
 * Get the current time slot
 * @param timeslot
 */
export const timeslotToUTCDate = (timeslot?: string): Date => {
    if (!timeslot) {
        return new UTCDate();
    }

    const [hour, minute] = timeslot.split(':');
    const now = new UTCDate();

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

export const timeslotToDate = (timeslot?: string): Date => {
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

export const timeslotToLocalDate = (timeslot: string) => {
    return toZonedTime(
        new Date(`${new Date().toISOString().split('T')[0]}T${timeslot}:00Z`), // Today's date + UTC time
        TZ
    )
}

/*  UTC "HH:mm" ──► local "HH:mm"  */
export const timeslotToLocalTime = (timeslot: string | null) =>
    timeslot ? formatInTimeZone(timeslotToLocalDate(timeslot), TZ, 'HH:mm') : null;

/*  local "HH:mm" ──► UTC "HH:mm"  */
export const timeslotToUTCTime = (timeslot: string | null) => {
    if (!timeslot) {
        return null;
    }
    const [h, m] = timeslot.split(':').map(Number);

    // Use today's date with the specified local time
    const today = new Date();
    const localDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        h,
        m
    );

    return formatInTimeZone(fromZonedTime(localDate, TZ), 'UTC', 'HH:mm');
};
