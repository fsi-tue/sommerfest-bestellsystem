// Pizza model
const { model, Schema } = require("mongoose")
import { Document } from "mongoose"

interface PizzaDocument extends Document {
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
        get: (v: number) => v,
        set: (v: number) => v
    },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Pizza = model('Pizza', pizzaSchema);

exports.Pizza = Pizza;
exports.PizzaDocument = PizzaDocument;
