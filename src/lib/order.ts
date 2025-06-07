import { OrderDocument } from "@/model/order";
import { ItemDocument } from "@/model/item";
import { getDateFromTimeSlot } from "@/lib/time";

export function ordersSortedByTimeslots(orders: OrderDocument[]): OrderDocument[] {
    const currentTime = new Date().getTime()
    const priorityByOrderId = new Map<OrderDocument, number>();

    // Filter orders
    const filteredOrders = orders.filter(order => order.status !== "cancelled" && order.status !== "delivered");

    for (const order of filteredOrders) {
        const tsDate = getDateFromTimeSlot(order.timeslot).getTime()
        const diff = tsDate - currentTime;
        priorityByOrderId.set(order, diff)
    }

    // Return sorted list
    return Array.from(priorityByOrderId)
        .toSorted((a, b) => a[1] - b[1])
        .map(order => order[0])
}

export function itemsOrderSortedByTimeslots(orders: OrderDocument[]) {
    return ordersSortedByTimeslots(orders).flatMap((order) => order.items)
}

export function matchRightOrder(readyItems: ItemDocument[], sortedOrders: OrderDocument[]): OrderDocument {
    const readyItemIds = readyItems.map(readyItem => readyItem._id.toString());

    // Filter orders
    const filteredOrders = sortedOrders.filter(order => order.status !== "cancelled" && order.status !== "delivered");
    const priorityByOrderId = new Map<OrderDocument, number>();

    for (const order of filteredOrders) {
        const overlap = order.items.map(item => item.item._id.toString()).filter(itemId => readyItemIds.includes(itemId)).length;
        priorityByOrderId.set(order, overlap)
    }

    return Array.from(priorityByOrderId)
        .toSorted((a, b) => a[1] - b[1])[0][0]
}
