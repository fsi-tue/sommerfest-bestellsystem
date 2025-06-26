import dbConnect from "@/lib/db";
import { ItemDocument, ItemModel } from "@/model/item";
import { UTCDate } from "@date-fns/utc";
import { OrderDocument, OrderModel } from "@/model/order";
import {
    addMinutes,
    format,
    isAfter,
    isBefore,
    setMilliseconds,
    setSeconds,
    startOfMinute,
    subMinutes
} from "date-fns";
import { TimeSlot, timeslotToUTCDate } from "@/lib/time";
import { AggregatedSlotData } from "@/model/timeslot";
import { OrderConfig, TimeSlotConfig } from "@/model/config";
import { getSystem } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
 * Aligns a given date to the start of its time slot and optionally shifts it by a number of slots.
 */
function getAlignedSlotStartTime(date: Date, slotSizeMinutes: number, pastSlotsToOffset: number): Date {
    let alignedTime = startOfMinute(date);
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
        }

        const orderTime = timeslotToUTCDate(order.timeslot);

        for (let i = 0; i < timeSlots.length; i++) {
            const slot = timeSlots[i];
            // Check if orderTime falls within the slot [startTime, stopTime)
            if (
                (isAfter(orderTime, slot.startTime) || orderTime.getTime() === slot.startTime.getTime()) &&
                isBefore(orderTime, slot.stopTime)
            ) {
                let orderTotalSize = 0;
                for (const orderItem of order.items) {
                    const itemDetails = itemsById[orderItem._id.toString()];
                    if (itemDetails) {
                        orderTotalSize += itemDetails.size;
                    }
                }
                slotAmounts[i] += orderTotalSize;
                break;
            }
        }
    }
    return slotAmounts;
}

/**
 * Formats the aggregated slot data for the API response.
 */
function formatResponseData(
    ORDER_CONFIG: OrderConfig,
    TIME_SLOT_CONFIG: TimeSlotConfig,
    timeSlots: TimeSlot[],
    slotAmounts: number[],
): AggregatedSlotData[] {
    const BUFFER = ORDER_CONFIG.TIMESLOTS_BUFFER // Time buffer in minutes
    const currentTimeWithBuffer = new Date()
    currentTimeWithBuffer.setMinutes(currentTimeWithBuffer.getMinutes() + BUFFER)
    return timeSlots.map((slot, index) => {
        const amount = slotAmounts[index];
        let color: string;
        if (amount > ORDER_CONFIG.ORDER_AMOUNT_THRESHOLDS.CRITICAL) {
            color = TIME_SLOT_CONFIG.STATUS_COLORS.CRIT;
        } else if (amount > ORDER_CONFIG.ORDER_AMOUNT_THRESHOLDS.WARNING) {
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
            isBlocked: amount > ORDER_CONFIG.ORDER_AMOUNT_THRESHOLDS.CRITICAL || timeslotTime > currentTimeWithBuffer
        } as AggregatedSlotData;
    });
}


export async function GET(request: Request) {
    await dbConnect();
    const system = await getSystem()

    const TIME_SLOT_CONFIG: TimeSlotConfig = system.config.TIME_SLOT_CONFIG;
    const ORDER_CONFIG: OrderConfig = system.config.ORDER_CONFIG;

    // We don't know which time zone the server has, thus we use and send the UTC time
    // which we then locally convert to the correct time
    const now = new UTCDate();

    // 1. Determine the reference start time for generating slots
    const firstSlotStartTime = getAlignedSlotStartTime(
        now,
        TIME_SLOT_CONFIG.SIZE_MINUTES,
        TIME_SLOT_CONFIG.PAST_SLOTS_TO_SHOW
    );

    // 2. Generate all time slots
    const timeSlots = generateTimeSlots(
        firstSlotStartTime,
        TIME_SLOT_CONFIG.PAST_SLOTS_TO_SHOW + 1 + TIME_SLOT_CONFIG.FUTURE_SLOTS_TO_SHOW,
        TIME_SLOT_CONFIG.SIZE_MINUTES
    );

    // 3. Determine the date range for fetching orders
    // Ensure the query covers all generated slots
    const minOrderDate = timeSlots[0].startTime;
    const maxOrderDate = timeSlots[timeSlots.length - 1].stopTime;

    // 4. Fetch data concurrently
    const [orders, itemsById] = await Promise.all([
            OrderModel.find({
                orderDate: { $gte: minOrderDate, $lt: maxOrderDate },
                status: { $ne: 'cancelled' },
            }).lean(),
            fetchAndMapItems(),
        ])
    ;

    // 5. Aggregate orders into time slots
    const orderAmountsPerSlot = aggregateOrdersIntoSlots(orders, timeSlots, itemsById);

    // 6. Format the response
    // The "current" slot in the UI corresponds to the one that `now` would fall into,
    // which is `PAST_SLOTS_TO_SHOW` index in our 0-indexed `timeSlots` array.
    const responseData = formatResponseData(ORDER_CONFIG, TIME_SLOT_CONFIG, timeSlots, orderAmountsPerSlot);

    return Response.json(responseData);
}
