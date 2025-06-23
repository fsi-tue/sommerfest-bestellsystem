import { Document, model, Model, Schema, Types } from "mongoose";
import { ItemDocument, itemSchema } from "./item";

export const ORDER_STATUSES = {
    ORDERED: 'ordered',
    ACTIVE: 'active',
    READY_FOR_PICKUP: 'ready',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
} as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];
export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUSES);

export interface Order {
    name: string;
    comment?: string;
    items: ItemDocument[];
    orderDate: Date;
    timeslot: string;
    totalPrice: number;
    isPaid: boolean;
    status: OrderStatus;
    finishedAt?: Date;
}

export interface SimpleOrder {
    name: string;
    items: { [_id: string]: ItemDocument[] };
    comment: string;
    timeslot: string | null;
}

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
            { type: itemSchema, ref: "item", required: true }
        ],
        orderDate: { type: Date, default: Date.now },
        timeslot: { type: String, required: true },
        totalPrice: { type: Number, required: true, min: 0 },
        isPaid: { type: Boolean, default: false },
        status: { type: String, enum: ORDER_STATUSES, default: ORDER_STATUS_VALUES[0] },
        finishedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

/**
 * Middleware to set `finishedAt` when the order is marked as completed.
 */
orderSchema.pre("save", function (next) {
    if (this.status === ORDER_STATUSES.COMPLETED && !this.finishedAt) {
        this.finishedAt = new Date();
    }
    next();
});

orderSchema.index({ timeslot: 1, status: 1 });
orderSchema.index({ timeslot: 1, status: 1, 'items.size': 1 });

// Create the Order model
let OrderModel: Model<OrderDocument>;
try {
    OrderModel = model<OrderDocument>("Order");
} catch (error) {
    OrderModel = model<OrderDocument>("Order", orderSchema);
}

export { OrderModel }
