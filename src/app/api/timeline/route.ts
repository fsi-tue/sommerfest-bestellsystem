import { TIME_SLOT_CONFIG } from "@/config";
import dbConnect from "@/lib/dbConnect";
import { aggregateOrdersIntoSlots, formatResponseData, generateTimeSlots, getAlignedSlotStartTime } from "@/lib/time";
import { ItemDocument, ItemModel } from "@/model/item";
import { OrderDocument, OrderModel } from "@/model/order";
import { UTCDate } from "@date-fns/utc";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

/**
 * Fetches orders within a given date range that are not cancelled.
 */
async function fetchOrders(minDate: Date, maxDate: Date): Promise<OrderDocument[]> {
    return OrderModel.find({
        orderDate: { $gte: minDate, $lt: maxDate },
        status: { $ne: 'cancelled' },
    }).lean();
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

export async function GET(request: Request) {
    await dbConnect();

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
        fetchOrders(minOrderDate, maxOrderDate),
        fetchAndMapItems(),
    ]);

    // 5. Aggregate orders into time slots
    const orderAmountsPerSlot = aggregateOrdersIntoSlots(orders, timeSlots, itemsById);

    // 6. Format the response
    // The "current" slot in the UI corresponds to the one that `now` would fall into,
    // which is `PAST_SLOTS_TO_SHOW` index in our 0-indexed `timeSlots` array.
    const responseData = formatResponseData(timeSlots, orderAmountsPerSlot);

    return Response.json(responseData);
}
