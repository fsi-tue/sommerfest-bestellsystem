// Pizza model
import { type Document, Model, model, Schema } from "mongoose"
import { FOOD } from "@/config";

export interface FoodDocument extends Document {
    _id: string;
    name: string;
    price: number;
    // Type of food
    type: 'pizza' | 'drink' | 'dessert';
    // Dietary requirements
    dietary?: 'vegan' | 'vegetarian' | 'gluten-free' | 'lactose-free' | 'halal' | 'kosher' | 'organic';
    // Size, e.g., 0.5 for half a pizza
    size: number
    ingredients: string[];
    // Maximum number of items available
    max: number;
    enabled: boolean;
    createdAt: Date;
}

const foodSchema = new Schema<FoodDocument>({
    name: { type: String, required: true },
    price: {
        required: true,
        type: Number,
        default: 0,
        min: 0,
        max: 100,
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
    size: {
        required: true,
        type: Number,
        default: 1,
        min: 0.1,
        max: 1
    },
    ingredients: [
        {
            type: String,
            required: true
        }
    ],
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
