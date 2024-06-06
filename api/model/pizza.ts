// Pizza model
import {model, Schema} from "mongoose";

export type PizzaType = {
    id: number;
    name: string;
    price: number;
    enabled: boolean;
    createdAt: Date;
}

const pizzaSchema = new Schema({
    id: {type: Number, autoIncrement: true, primaryKey: true},
    name: {type: String, required: true},
    price: {type: Number},
    enabled: {type: Boolean},
    createdAt: {type: Date, default: Date.now}
});

export const Pizza = model('Pizza', pizzaSchema);
