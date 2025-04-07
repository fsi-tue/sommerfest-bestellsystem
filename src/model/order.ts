import { Schema, model, Document, Model, Types } from "mongoose";
import { FoodDocument } from "./food";
import { getDateFromTimeSlot } from "@/lib/time";

/**
 * Represents the different statuses an order can have.
 */
export type OrderStatus = "ordered" | "inPreparation" | "ready" | "delivered" | "cancelled";
export const ORDER_STATES: OrderStatus[] = ["ordered", "inPreparation", "ready", "delivered", "cancelled"];

/**
 * Represents the different statuses an item (food) can have during preparation.
 */
export type ItemStatus = "prepping" | "readyToCook" | "cooking" | "ready" | "delivered" | "cancelled";
export const ITEM_STATES: ItemStatus[] = ["prepping", "readyToCook", "cooking", "ready", "delivered", "cancelled"];

/**
 * Order item interface.
 */
export interface OrderItem {
  food: FoodDocument; // Reference to FoodDocument
  status: ItemStatus;
}

/**
 * Order interface.
 */
export interface Order {
  name: string;
  comment?: string;
  items: OrderItem[];
  orderDate: Date;
  timeslot: string;
  totalPrice: number;
  isPaid: boolean;
  status: OrderStatus;
  finishedAt?: Date;
}

/**
 * Order document interface (extends Mongoose's Document).
 * Includes the `_id` field explicitly.
 */
export interface OrderDocument extends Order, Document {
  _id: Types.ObjectId; // Explicitly include the `_id` field
}

/**
 * Order schema definition.
 */
const orderSchema = new Schema<OrderDocument>(
  {
    name: { type: String, required: true },
    comment: { type: String },
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food", required: true },
        status: { type: String, enum: ITEM_STATES, default: ITEM_STATES[0] },
      },
    ],
    orderDate: { type: Date, default: Date.now },
    timeslot: { type: String, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
    isPaid: { type: Boolean, default: false },
    status: { type: String, enum: ORDER_STATES, default: ORDER_STATES[0] },
    finishedAt: { type: Date },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

/**
 * Middleware to set `finishedAt` when the order is marked as delivered.
 */
orderSchema.pre("save", function (next) {
  if (this.status === "delivered" && !this.finishedAt) {
    this.finishedAt = new Date();
  }
  next();
});

/**
 * Middleware to update order status based on item statuses.
 */
orderSchema.pre("save", function (next) {
  const allStatuses = this.items.map((item) => item.status);
  const uniqueStatuses = new Set(allStatuses);

  // If the order is cancelled or delivered, set all items to the same status
  if (this.status === "cancelled" || this.status === "delivered") {
    this.items.forEach((item) => {
      item.status = this.status as ItemStatus; // Safe cast
    });
    return next();
  }

  // Update the order status based on the statuses of the items
  if (uniqueStatuses.has("prepping")) {
    this.status = "ordered";
  } else if (uniqueStatuses.size === 1 && uniqueStatuses.has("readyToCook")) {
    this.status = "inPreparation";
  } else if (uniqueStatuses.size === 1 && uniqueStatuses.has("cooking")) {
    this.status = "inPreparation";

    // If the timeslot has passed, mark the order as ready
    if (getDateFromTimeSlot(this.timeslot).toDate().getTime() <= new Date().getTime()) {
      this.status = "ready";
    }
  } else if (uniqueStatuses.size === 1 && uniqueStatuses.has("ready")) {
    this.status = "ready";
  }

  next();
});

// Create the Order model
let OrderModel: Model<OrderDocument>;
try {
  OrderModel = model<OrderDocument>("Order");
} catch (error) {
  OrderModel = model<OrderDocument>("Order", orderSchema);
}

export { OrderModel };
