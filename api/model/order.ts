import { type Document, model, Schema } from "mongoose";
import { PizzaDocument } from "./pizza";

export const MAX_PIZZAS = 12;

export interface OrderDocument extends Document {
    name: string;
    pizzas: PizzaDocument[];
    orderDate: Date;
    totalPrice: number;
    finishedAt?: Date;
    status: 'pending' | 'paid' | 'ready' | 'delivered' | 'cancelled';
}

const orderSchema = new Schema<OrderDocument>({
    name: {
        type: String,
        required: true,
    },
    pizzas: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Pizza',
            required: true
        }
    ],
    orderDate: {
        type: Date,
        default: Date.now,
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

// Custom validator for the length of the pizzas array
orderSchema.path('pizzas').validate({
    validator: function (value) {
        return value.length > 0 && value.length <= MAX_PIZZAS;
    },
    message: props => `An order must have between 1 and ${MAX_PIZZAS} pizzas. Currently, it has ${props.value.length}.`
});

// Middleware to set finishedAt when the order is marked as finished
orderSchema.pre('save', function (next) {
    if (this.status === 'delivered' && !this.finishedAt) {
        this.finishedAt = new Date();
    }
    // TODO: revalidate the pizza price
    next();
});

export const Order = model('Order', orderSchema);
