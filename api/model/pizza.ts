// Pizza model
import { type Document, model, Schema } from "mongoose";

export interface PizzaDocument extends Document {
    id: number;
    name: string;
    price: number;
    enabled: boolean;
    createdAt: Date;
}

const pizzaSchema = new Schema<PizzaDocument>({
    id: { type: Number, autoIncrement: true, primaryKey: true },
    name: { type: String, required: true },
    price: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0,
        get: (v: number) => Math.round(v),
        set: (v: number) => Math.round(v)
    },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

export const Pizza = model('Pizza', pizzaSchema);
