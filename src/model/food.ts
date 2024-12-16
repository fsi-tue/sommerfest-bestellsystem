import { Schema, model, Document, Model, Types } from "mongoose";
import { FOOD } from "@/config";

export interface Food {
  name: string;
  price: number;
  type: string; // Type of food
  dietary?: string; // Dietary requirements
  ingredients?: string[];
  size: number; // Size, e.g., 0.5 for half a pizza
  max: number; // Maximum number of items available
  enabled: boolean;
  createdAt: Date;
}

// Extend the interface to include the MongoDB `_id` field
export interface FoodDocument extends Food, Document {
  _id: Types.ObjectId; // Explicitly define `_id` as ObjectId
}

// Define the schema for the Food model
const foodSchema = new Schema<FoodDocument>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0, min: 0, max: 100 },
    type: { type: String, required: true },
    dietary: { type: String },
    ingredients: { type: [String] },
    size: { type: Number, required: true, default: 1, min: 0.1, max: 1 },
    max: { type: Number, default: FOOD.MAX_ITEMS },
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Create the Food model
const FoodModel: Model<FoodDocument> = model<FoodDocument>("Food", foodSchema);

export { FoodModel };