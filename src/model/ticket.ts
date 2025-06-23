import { Document, model, Model, Schema, Types } from 'mongoose';
import { ItemDocument } from "@/model/item";

export const TICKET_STATUS = {
    DEMANDED: 'demanded',             // Requested by an order, not yet in active baking queue
    ACTIVE: 'active',                 // Selected from demand, waiting for bakers to start
    READY: 'ready',                   // Cooked, 0.5 portion available on the counter, unassigned
    COMPLETED: 'completed',           // Given to the customer
    CANCELLED_WASTE: 'cancelled_waste'// Portion was made but order cancelled / not picked up
} as const;
export type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];
export const TICKET_STATUS_VALUES = Object.values(TICKET_STATUS);

export interface ItemTicket {
    status: TicketStatus;
    orderId?: Types.ObjectId
    timeslot?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ItemTicketDocument extends ItemTicket, Document {
    itemTypeRef: Types.ObjectId;
    _id: Types.ObjectId;
}

export interface ItemTicketDocumentWithItem extends ItemTicket, Document {
    itemTypeRef: ItemDocument;
    _id: Types.ObjectId;
}

const itemTicketSchema = new Schema<ItemTicketDocument>({
    itemTypeRef: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    status: {
        type: String,
        enum: Object.values(TICKET_STATUS),
        required: true,
        default: TICKET_STATUS.DEMANDED
    },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    timeslot: { type: String }
}, { timestamps: true });

itemTicketSchema.index({ status: 1, itemTypeRef: 1 });

let ItemTicketModel: Model<ItemTicketDocument>;
try {
    ItemTicketModel = model<ItemTicketDocument>('ItemTicket');
} catch (error) {
    ItemTicketModel = model<ItemTicketDocument>('ItemTicket', itemTicketSchema);
}

export { ItemTicketModel };
