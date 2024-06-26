import { type Document, Model, model, Schema } from "mongoose";
import { FoodDocument } from "./food";
import { ORDER } from "@/config";

export type OrderStatus = 'pending' | 'paid' | 'ready' | 'delivered' | 'cancelled';
export const ORDER_STATES: OrderStatus[] = ['pending', 'paid', 'ready', 'delivered', 'cancelled'];

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
        enum: ['pending', 'paid', 'ready', 'delivered', 'cancelled'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

// Custom validator for the length of the food array
orderSchema.path('items').validate({
    validator: function (value) {
        return value.length > 0 && value.length <= ORDER.MAX_ITEMS_PER_ORDER;
    },
    message: props => `An order must have between 1 and ${ORDER.MAX_ITEMS_PER_ORDER} items. Currently, it has ${props.value.length}.`
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
