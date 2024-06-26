// Pizza model
import { type Document, Model, model, Schema } from "mongoose"
import { FOOD } from "@/config";

export interface FoodDocument extends Document {
    _id: string;
    name: string;
    price: number;
    type: 'pizza' | 'drink' | 'dessert'; // Type of food
    dietary?: 'vegan' | 'vegetarian' | 'gluten-free' | 'lactose-free' | 'halal' | 'kosher' | 'organic'; // Dietary requirements
    max: number; // Maximum number of items available
    enabled: boolean;
    createdAt: Date;
}

const foodSchema = new Schema<FoodDocument>({
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
    max: { type: Number, default: FOOD.MAX_ITEMS },
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
