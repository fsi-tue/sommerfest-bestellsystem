import { type Document, Model, model, Schema } from "mongoose";
import { FoodDocument } from "./food";
import { getDateFromTimeSlot } from "@/lib/time";

/**
 * Represents the different statuses an order can have.
 * - `ordered`: The order has been placed and is waiting to be processed.
 * - `inPreparation`: The order is being prepared.
 * - `ready`: The order is ready to be delivered.
 * - `delivered`: The order has been delivered.
 * - `cancelled`: The order has been cancelled.
 */
export type OrderStatus =
    'ordered' |
    'inPreparation' |
    'ready' |
    'delivered' |
    'cancelled';
/**
 * Array of possible order statuses.
 */
export const ORDER_STATES: OrderStatus[] = ['ordered', 'inPreparation', 'ready', 'delivered', 'cancelled'];


/**
 * Represents the different statuses an item (food) can have during preparation.
 * - `prepping`: The item is being prepared.
 * - `readyToCook`: The item is ready to be cooked.
 * - `cooking`: The item is being cooked.
 * - `ready`: The item is ready.
 * - `delivered`: The item has been delivered.
 * - `cancelled`: The item has been cancelled.
 */
export type ItemStatus =
    'prepping' |
    'readyToCook' |
    'cooking' |
    'ready' |
    'delivered' |
    'cancelled';

/**
 * Array of possible item statuses.
 */
export const ITEM_STATES: ItemStatus[] = ['prepping', 'readyToCook', 'cooking', 'ready', 'delivered', 'cancelled'];

export interface Order {
    name: string;
    comment?: string;
    items: {
        food: FoodDocument;
        status: ItemStatus;
    }[];
    orderDate: Date;
    timeslot: string;
    totalPrice: number;
    isPaid: boolean;
    status: OrderStatus;
    finishedAt?: Date;
}

export interface OrderWithId extends Order {
    _id: string
}

/**
 * Represents an order.
 */
export interface OrderDocument extends Order, Document {}

const orderSchema = new Schema<OrderDocument>({
    name: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: false,
    },
    items: [
        {
            food: {
                type: Schema.Types.ObjectId,
                ref: 'food',
                required: true,
            },
            status: {
                type: String,
                enum: ITEM_STATES,
                default: ITEM_STATES[0],
            },
        },
    ],
    orderDate: {
        type: Date,
        default: Date.now,
    },
    timeslot: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ORDER_STATES,
        default: ORDER_STATES[0],
    },
    finishedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Middleware to set finishedAt when the order is marked as finished
orderSchema.pre('save', function (next) {
    if (this.status === 'delivered' && !this.finishedAt) {
        this.finishedAt = new Date();
    }
    next();
});

// Middleware
orderSchema.pre('save', function (next) {
    const allStatuses = this.items.map(item => item.status);
    const uniqueStatuses = new Set(allStatuses);

    // If the order is cancelled or delivered, set all items to the same status
    if (this.status === 'cancelled' || this.status === 'delivered') {
        this.items.forEach(item => {
            // This is safe because item.status can be 'cancelled' or 'delivered'
            item.status = this.status as ItemStatus;
        });
        return next();
    }

    // Set the status of the order based on the status of the items
    if (uniqueStatuses.has('prepping')) {
        this.status = 'ordered';
    } else if (uniqueStatuses.size === 1 && uniqueStatuses.has('readyToCook')) {
        this.status = 'inPreparation';
    } else if (uniqueStatuses.size === 1 && uniqueStatuses.has('cooking')) {
        this.status = 'inPreparation';
        if (getDateFromTimeSlot(this.timeslot).toDate().getTime() <= new Date().getTime()) {
            this.status = 'ready';
        }
    } else if (uniqueStatuses.size === 1 && uniqueStatuses.has('ready')) {
        this.status = 'ready';
    }

    next();
});


let Order: Model<OrderDocument>;
try {
    Order = model<OrderDocument>('order', orderSchema);
} catch (error) {
    Order = model<OrderDocument>('order');
}
export { Order }
