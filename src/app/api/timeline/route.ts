import dbConnect from "@/lib/dbConnect";
import { OrderDocument, OrderModel } from '@/model/order'; // Assuming OrderDocument is the Mongoose document type
import { ItemDocument, ItemModel } from "@/model/item";
import { getDateFromTimeSlot } from "@/lib/time";

import {
    addMinutes,
    format,
    isAfter,
    isBefore,
    setMilliseconds,
    setSeconds,
    startOfMinute,
    subMinutes
} from 'date-fns';
import { ORDER_CONFIG } from "@/config";
import { AggregatedSlotData } from "@/model/timeslot";

// Next.js specific settings
// Thanks to https://medium.com/phantom3/next-js-14-build-prerender-error-fix-f3c51de2fe1d
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// --- Configuration Constants ---
const TIME_SLOT_CONFIG = {
    SIZE_MINUTES: 10,
    PAST_SLOTS_TO_SHOW: 5, // Number of slots to show before the current aligned time
    FUTURE_SLOTS_TO_SHOW: 14, // Number of slots to show after (total 15 including current, so 14 future)
    // TOTAL_SLOTS will be PAST_SLOTS_TO_SHOW + 1 (for current) + FUTURE_SLOTS_TO_SHOW
};
const TOTAL_SLOTS = TIME_SLOT_CONFIG.PAST_SLOTS_TO_SHOW + 1 + TIME_SLOT_CONFIG.FUTURE_SLOTS_TO_SHOW;

const ORDER_AMOUNT_THRESHOLDS = {
    WARNING: 3,
    CRITICAL: 5,
};

const STATUS_COLORS = {
    OK: '#0ce504',
    WARN: '#e59604',
    CRIT: '#B33',
};

const BORDER_STYLES = {
    DEFAULT_COLOR: '#FFF',
    CURRENT_SLOT_COLOR: '#000',
    DEFAULT_WIDTH: 0,
    CURRENT_SLOT_WIDTH: 4,
};

// --- Helper Types ---
interface TimeSlot {
    time: string; // Formatted time like HH:mm
    startTime: Date;
    stopTime: Date;
}

// --- Helper Functions ---

/**
 * Aligns a given date to the start of its time slot and optionally shifts it by a number of slots.
 */
function getAlignedSlotStartTime(date: Date, slotSizeMinutes: number, pastSlotsToOffset: number): Date {
    let alignedTime = startOfMinute(date); // Ensures we are at the beginning of a minute
    const minutesOverSlot = alignedTime.getMinutes() % slotSizeMinutes;
    alignedTime = subMinutes(alignedTime, minutesOverSlot);
    alignedTime = setSeconds(setMilliseconds(alignedTime, 0), 0);
    return subMinutes(alignedTime, pastSlotsToOffset * slotSizeMinutes);
}

/**
 * Generates an array of time slots.
 */
function generateTimeSlots(
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
 * Fetches orders within a given date range that are not cancelled.
 */
async function fetchOrders(minDate: Date, maxDate: Date): Promise<OrderDocument[]> {
    return OrderModel.find({
        orderDate: { $gte: minDate, $lt: maxDate },
        status: { $ne: 'cancelled' },
    }).lean(); // Use .lean() for better performance if you don't need Mongoose instance methods
}

/**
 * Fetches all items and maps them by their ID.
 */
async function fetchAndMapItems(): Promise<Record<string, ItemDocument>> {
    const items = await ItemModel.find().lean();
    return items.reduce((map: Record<string, ItemDocument>, item) => {
        map[item._id.toString()] = item;
        return map;
    }, {});
}

/**
 * Aggregates orders into their respective time slots, summing item sizes.
 */
function aggregateOrdersIntoSlots(
    orders: OrderDocument[],
    timeSlots: TimeSlot[],
    itemsById: Record<string, ItemDocument>
): number[] {
    const slotAmounts = new Array(timeSlots.length).fill(0);

    for (const order of orders) {
        if (!order.timeslot || !order.items) {
            continue;
        } // Basic validation

        const orderTime = getDateFromTimeSlot(order.timeslot); // Assuming this returns a valid Date

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
function formatResponseData(
    timeSlots: TimeSlot[],
    slotAmounts: number[],
    currentSlotIndex: number
): AggregatedSlotData[] {
    const BUFFER = ORDER_CONFIG.TIMESLOTS_BUFFER // Time buffer in minutes
    const currentTimeWithBuffer = new Date()
    currentTimeWithBuffer.setMinutes(currentTimeWithBuffer.getMinutes() + BUFFER)
    return timeSlots.map((slot, index) => {
        const amount = slotAmounts[index];
        let color: string;
        if (amount > ORDER_AMOUNT_THRESHOLDS.CRITICAL) {
            color = STATUS_COLORS.CRIT;
        } else if (amount > ORDER_AMOUNT_THRESHOLDS.WARNING) {
            color = STATUS_COLORS.WARN;
        } else {
            color = STATUS_COLORS.OK;
        }

        // This is needed to check if the timeslot is blocked
        const timeslotTime = getDateFromTimeSlot(slot.time)

        return {
            time: slot.time,
            ordersAmount: amount,
            color: color,
            border: index === currentSlotIndex ? BORDER_STYLES.CURRENT_SLOT_COLOR : BORDER_STYLES.DEFAULT_COLOR,
            borderwidth: index === currentSlotIndex ? BORDER_STYLES.CURRENT_SLOT_WIDTH : BORDER_STYLES.DEFAULT_WIDTH,
            isBlocked: amount > ORDER_AMOUNT_THRESHOLDS.CRITICAL || timeslotTime > currentTimeWithBuffer
        } as AggregatedSlotData;
    });
}

// --- API Route Handler ---
export async function GET(request: Request) {
    await dbConnect();

    const now = new Date();

    // 1. Determine the reference start time for generating slots
    const firstSlotStartTime = getAlignedSlotStartTime(
        now,
        TIME_SLOT_CONFIG.SIZE_MINUTES,
        TIME_SLOT_CONFIG.PAST_SLOTS_TO_SHOW
    );

    // 2. Generate all time slots
    const timeSlots = generateTimeSlots(
        firstSlotStartTime,
        TOTAL_SLOTS,
        TIME_SLOT_CONFIG.SIZE_MINUTES
    );

    // 3. Determine the date range for fetching orders
    // Ensure the query covers all generated slots
    const minOrderDate = timeSlots[0].startTime;
    const maxOrderDate = timeSlots[timeSlots.length - 1].stopTime;

    // 4. Fetch data concurrently
    const [orders, itemsById] = await Promise.all([
        fetchOrders(minOrderDate, maxOrderDate),
        fetchAndMapItems(),
    ]);

    // 5. Aggregate orders into time slots
    const orderAmountsPerSlot = aggregateOrdersIntoSlots(orders, timeSlots, itemsById);

    // 6. Format the response
    // The "current" slot in the UI corresponds to the one that `now` would fall into,
    // which is `PAST_SLOTS_TO_SHOW` index in our 0-indexed `timeSlots` array.
    const currentSlotDisplayIndex = TIME_SLOT_CONFIG.PAST_SLOTS_TO_SHOW;
    const responseData = formatResponseData(timeSlots, orderAmountsPerSlot, currentSlotDisplayIndex);

    return Response.json(responseData);
}
