import { type Document, Model, model, Schema } from "mongoose";
import { FoodDocument } from "./food";
import { ORDER } from "@/config";

export type OrderStatus = 'pending' | 'paid' | 'baking' | 'ready' | 'delivered' | 'cancelled';
export const ORDER_STATES: OrderStatus[] = ['pending', 'paid', 'baking', 'ready', 'delivered', 'cancelled'];


export const statusToText = (status: string) => {
    if (status === 'ready') {
        return 'Your order is ready for pickup!';
    } else if (status === 'pending') {
        return 'Please pay at the counter.';
    } else if (status === 'baking') {
        return 'Its getting hot 🔥:)';
    } else if (status === 'paid') {
        return 'Your order is being prepared...';
    } else if (status === 'delivered') {
        return 'Your order has been delivered!';
    } else if (status === 'cancelled') {
        return 'Your order has been cancelled.';
    } else {
        return 'Unknown status';
    }
}

export interface OrderDocument extends Document {
    _id: string;
    name: string;
    comment?: string;
    items: FoodDocument[];
    orderDate: Date;
    timeslot: string;
    totalPrice: number;
    finishedAt?: Date;
    status: OrderStatus;
}

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
            type: Schema.Types.ObjectId,
            ref: 'Food',
            required: true
        }
    ],
    orderDate: {
        type: Date,
        default: Date.now,
    },
    timeslot: {
        type: String,
        required: false,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    finishedAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: ORDER_STATES,
        default: ORDER_STATES[0],
    },
}, {
    timestamps: true,
});

// Middleware to set finishedAt when the order is marked as finished
orderSchema.pre('save', function (next) {
    if (this.status === 'delivered' && !this.finishedAt) {
        this.finishedAt = new Date();
    }
    // TODO: revalidate the pizza price
    next();
});


let Order: Model<OrderDocument>;
try {
    Order = model<OrderDocument>('order', orderSchema);
} catch (error) {
    Order = model<OrderDocument>('order');
}
export { Order }
