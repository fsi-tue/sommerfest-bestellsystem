// Pizza model
import { type Document, Model, model, Schema } from "mongoose"

export interface FoodDocument extends Document {
    id: number;
    name: string;
    price: number;
    type: 'pizza' | 'drink' | 'dessert';
    dietary?: 'vegan' | 'vegetarian' | 'gluten-free' | 'lactose-free' | 'halal' | 'kosher' | 'organic';
    enabled: boolean;
    createdAt: Date;
}

const foodSchema = new Schema<FoodDocument>({
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
    type: {
        type: String,
        enum: ['pizza', 'grill'],
        required: true
    },
    dietary: {
        type: String,
        enum: ['vegan', 'vegetarian', 'gluten-free', 'lactose-free', 'halal', 'kosher', 'organic'],
        required: false
    },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

let Food: Model<FoodDocument>;
try {
    Food = model<FoodDocument>('food', foodSchema);
} catch (error) {
    Food = model<FoodDocument>('food');
}
export { Food }
