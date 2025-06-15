import { Document, model, Model, Schema, Types } from "mongoose";

export interface Item {
    name: string;
    price: number;
    type: string;
    dietary?: string;
    ingredients?: string[];
    size: number;
    enabled: boolean;
    createdAt?: Date;
}

// Extend the interface to include the MongoDB `_id` field
export interface ItemDocument extends Item, Document {
    _id: Types.ObjectId;
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
        enabled: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

itemSchema.index({ price: 1 });


// Create the Item model
let ItemModel: Model<ItemDocument>;
try {
    ItemModel = model<ItemDocument>("Item");
} catch (error) {
    ItemModel = model<ItemDocument>("Item", itemSchema);
}

export { ItemModel };
