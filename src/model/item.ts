import { Document, model, Model, Schema, Types } from "mongoose";
import { ITEM_CONFIG } from "@/config";

export interface Item {
    name: string;
    price: number;
    type: string; // Type of item
    dietary?: string; // Dietary requirements
    ingredients?: string[];
    size: number; // Size, e.g., 0.5 for half a pizza
    max: number; // Maximum number of items available
    enabled: boolean;
    createdAt: Date;
}

// Extend the interface to include the MongoDB `_id` field
export interface ItemDocument extends Item, Document {
    _id: Types.ObjectId; // Explicitly define `_id` as ObjectId
}

// Define the schema for the Item model
export const itemSchema = new Schema<ItemDocument>(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true, default: 0, min: 0, max: 100 },
        type: { type: String, required: true },
        dietary: { type: String },
        ingredients: { type: [String] },
        size: { type: Number, required: true, default: 1, min: 0.1, max: 1 },
        max: { type: Number, default: ITEM_CONFIG.MAX_ITEMS },
        enabled: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

// Create the Item model
let ItemModel: Model<ItemDocument>;
try {
    ItemModel = model<ItemDocument>("Item");
} catch (error) {
    ItemModel = model<ItemDocument>("Item", itemSchema);
}

export { ItemModel };
