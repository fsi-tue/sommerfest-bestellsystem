import mongoose from "mongoose";
import {PizzaType} from "./pizza";

const orderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    pizzas: [{
        type: Number,
        ref: 'Pizza',
        required: true,
    }],
    orderDate: {
        type: Date,
        default: Date.now,
    },
    totalPrice: {
        type: Number,
        required: true,
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

// Middleware to set finishedAt when the order is marked as finished
orderSchema.pre('save', function (next) {
    if (this.status === 'delivered' && !this.finishedAt) {
        this.finishedAt = new Date();
    }
    next();
});

export const Order = mongoose.model('Order', orderSchema);
