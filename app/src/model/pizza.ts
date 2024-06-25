// Pizza model
import { type Document, Model, model, Schema } from "mongoose"

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
        get: (v: number) => v,
        set: (v: number) => v
    },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

let Pizza: Model<PizzaDocument>;
try {
    Pizza = model<PizzaDocument>('pizza', pizzaSchema);
} catch (error) {
    Pizza = model<PizzaDocument>('pizza');
}
export { Pizza }
