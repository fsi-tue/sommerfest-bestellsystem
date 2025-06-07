import { Document, model, Model, Schema, Types } from "mongoose";
import { ItemDocument, itemSchema } from "./item";
import { getDateFromTimeSlot } from "@/lib/time";

// Status enums with better type safety
export const ORDER_STATUSES = {
    ORDERED: 'ordered',
    IN_PREPARATION: 'inPreparation',
    READY: 'ready',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
} as const;

export const ITEM_STATUSES = {
    PREPPING: 'prepping',
    READY_TO_COOK: 'readyToCook',
    COOKING: 'cooking',
    READY: 'ready',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
} as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];
export type ItemStatus = typeof ITEM_STATUSES[keyof typeof ITEM_STATUSES];

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUSES);
export const ITEM_STATUS_VALUES = Object.values(ITEM_STATUSES);

/**
 * Order item interface.
 */
export interface OrderItem {
    item: ItemDocument;
    status: ItemStatus;
}

/**
 * Order interface.
 */
export interface Order {
    name: string;
    comment?: string;
    items: OrderItem[];
    orderDate: Date;
    timeslot: string;
    totalPrice: number;
    isPaid: boolean;
    status: OrderStatus;
    finishedAt?: Date;
}

export interface ApiOrder {
    name: string;
    items: { [_id: string]: ItemDocument[] };
    comment: string;
    timeslot: string | null;
}

/**
 * Order document interface (extends Mongoose's Document).
 * Includes the `_id` field explicitly.
 */
export interface OrderDocument extends Order, Document {
    _id: Types.ObjectId;
}

/**
 * Order schema definition.
 */
const orderSchema = new Schema<OrderDocument>(
    {
        name: { type: String, required: true },
        comment: { type: String },
        items: [
            {
                item: { type: itemSchema, ref: "item", required: true },
                status: { type: String, enum: ITEM_STATUSES, default: ITEM_STATUS_VALUES[0] },
            },
        ],
        orderDate: { type: Date, default: Date.now },
        timeslot: { type: String, required: true },
        totalPrice: { type: Number, required: true, min: 0 },
        isPaid: { type: Boolean, default: false },
        status: { type: String, enum: ORDER_STATUSES, default: ORDER_STATUS_VALUES[0] },
        finishedAt: { type: Date },
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
    }
);

/**
 * Middleware to set `finishedAt` when the order is marked as delivered.
 */
orderSchema.pre("save", function (next) {
    if (this.status === "delivered" && !this.finishedAt) {
        this.finishedAt = new Date();
    }
    next();
});

/**
 * Middleware to update order status based on item statuses.
 */
orderSchema.pre("save", function (next) {
    const allStatuses = this.items.map((item) => item.status);
    const uniqueStatuses = new Set(allStatuses);

    // If the order is cancelled or delivered, set all items to the same status
    if (this.status === "cancelled" || this.status === "delivered") {
        this.items.forEach((item) => {
            item.status = this.status as ItemStatus;
        });
        return next();
    }

    // Update the order status based on the statuses of the items
    if (uniqueStatuses.has("prepping")) {
        this.status = "ordered";
    } else if (uniqueStatuses.size === 1 && uniqueStatuses.has("readyToCook")) {
        this.status = "inPreparation";
    } else if (uniqueStatuses.size === 1 && uniqueStatuses.has("cooking")) {
        this.status = "inPreparation";

        // If the timeslot has passed, mark the order as ready
        if (getDateFromTimeSlot(this.timeslot).toDate().getTime() <= new Date().getTime()) {
            this.status = "ready";
        }
    } else if (uniqueStatuses.size === 1 && uniqueStatuses.has("ready")) {
        this.status = "ready";
    }

    next();
});

// Create the Order model
let OrderModel: Model<OrderDocument>;
try {
    OrderModel = model<OrderDocument>("Order");
} catch (error) {
    OrderModel = model<OrderDocument>("Order", orderSchema);
}

export { OrderModel }
