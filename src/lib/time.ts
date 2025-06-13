import {
    addMinutes,
    format,
    isAfter,
    isBefore,
    setHours,
    setMilliseconds,
    setMinutes,
    setSeconds,
    startOfMinute,
    subMinutes
} from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { ORDER_AMOUNT_THRESHOLDS, ORDER_CONFIG, TIME_SLOT_CONFIG } from "@/config";
import { AggregatedSlotData } from "@/model/timeslot";
import { OrderDocument } from "@/model/order";
import { ItemDocument } from "@/model/item";
import { UTCDate } from "@date-fns/utc";

// Timezone of the user
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

export interface TimeSlot {
    time: string; // Formatted time like HH:mm
    startTime: Date;
    stopTime: Date;
}


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
export const timeslotToUTCDate = (timeslot: string): Date => {
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

export const timeslotToDate = (timeslot: string): Date => {
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


/**
 * Aligns a given date to the start of its time slot and optionally shifts it by a number of slots.
 */
export function getAlignedSlotStartTime(date: Date, slotSizeMinutes: number, pastSlotsToOffset: number): Date {
    let alignedTime = startOfMinute(date);
    const minutesOverSlot = alignedTime.getMinutes() % slotSizeMinutes;
    alignedTime = subMinutes(alignedTime, minutesOverSlot);
    alignedTime = setSeconds(setMilliseconds(alignedTime, 0), 0);
    return subMinutes(alignedTime, pastSlotsToOffset * slotSizeMinutes);
}

/**
 * Generates an array of time slots.
 */
export function generateTimeSlots(
    initialStartTime: Date,
    numSlots: number,
    slotSizeMinutes: number
): TimeSlot[] {
    const slots: TimeSlot[] = [];
    let currentSlotStartTime = initialStartTime;

    for (let i = 0; i < numSlots; i++) {
        const slotEndTime = addMinutes(currentSlotStartTime, slotSizeMinutes);
        slots.push({
            time: format(currentSlotStartTime, 'HH:mm'),
            startTime: currentSlotStartTime,
            stopTime: slotEndTime,
        });
        currentSlotStartTime = slotEndTime;
    }
    return slots;
}


/**
 * Aggregates orders into their respective time slots, summing item sizes.
 */
export function aggregateOrdersIntoSlots(
    orders: OrderDocument[],
    timeSlots: TimeSlot[],
    itemsById: Record<string, ItemDocument>
): number[] {
    const slotAmounts = new Array(timeSlots.length).fill(0);

    for (const order of orders) {
        if (!order.timeslot || !order.items) {
            continue;
        } // Basic validation

        const orderTime = timeslotToUTCDate(order.timeslot); // Assuming this returns a valid Date

        for (let i = 0; i < timeSlots.length; i++) {
            const slot = timeSlots[i];
            // Check if orderTime falls within the slot [startTime, stopTime)
            if (
                (isAfter(orderTime, slot.startTime) || orderTime.getTime() === slot.startTime.getTime()) &&
                isBefore(orderTime, slot.stopTime)
            ) {
                let orderTotalSize = 0;
                for (const orderItem of order.items) {
                    const itemDetails = itemsById[orderItem.item._id.toString()];
                    if (itemDetails) {
                        orderTotalSize += itemDetails.size;
                    }
                }
                slotAmounts[i] += orderTotalSize;
                break; // Order belongs to one slot, move to the next order
            }
        }
    }
    return slotAmounts;
}

/**
 * Formats the aggregated slot data for the API response.
 */
export function formatResponseData(
    timeSlots: TimeSlot[],
    slotAmounts: number[],
): AggregatedSlotData[] {
    const BUFFER = ORDER_CONFIG.TIMESLOTS_BUFFER // Time buffer in minutes
    const currentTimeWithBuffer = new Date()
    currentTimeWithBuffer.setMinutes(currentTimeWithBuffer.getMinutes() + BUFFER)
    return timeSlots.map((slot, index) => {
        const amount = slotAmounts[index];
        let color: string;
        if (amount > ORDER_AMOUNT_THRESHOLDS.CRITICAL) {
            color = TIME_SLOT_CONFIG.STATUS_COLORS.CRIT;
        } else if (amount > ORDER_AMOUNT_THRESHOLDS.WARNING) {
            color = TIME_SLOT_CONFIG.STATUS_COLORS.WARN;
        } else {
            color = TIME_SLOT_CONFIG.STATUS_COLORS.OK;
        }

        // This is needed to check if the timeslot is blocked
        const timeslotTime = timeslotToUTCDate(slot.time)

        return {
            time: slot.time,
            ordersAmount: amount,
            color: color,
            border: TIME_SLOT_CONFIG.BORDER_STYLES.DEFAULT_COLOR,
            borderwidth: TIME_SLOT_CONFIG.BORDER_STYLES.DEFAULT_WIDTH,
            isBlocked: amount > ORDER_AMOUNT_THRESHOLDS.CRITICAL || timeslotTime > currentTimeWithBuffer
        } as AggregatedSlotData;
    });
}
