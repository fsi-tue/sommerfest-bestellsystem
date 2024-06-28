import { type Document, Model, model, Schema } from "mongoose";
import { FoodDocument } from "./food";

export type OrderStatus = 'pending' | 'baking' | 'ready' | 'delivered' | 'cancelled';
export const ORDER_STATES: OrderStatus[] = ['pending', 'baking', 'ready', 'delivered', 'cancelled'];


export interface OrderDocument extends Document {
    _id: string;
    name: string;
    comment?: string;
    items: FoodDocument[];
    orderDate: Date;
    timeslot: string;
    totalPrice: number;
    finishedAt?: Date;
    isPaid: boolean;
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
    isPaid: {
        type: Boolean,
        default: false,
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
