import { Document, model, Model, Schema, Types } from "mongoose";
import { EditableConfig } from "@/model/config";

export interface SystemStatus {
    active: boolean;
    message?: string;
}

export interface System {
    name: string;
    status: SystemStatus;
    config: EditableConfig;
}

export interface SystemDocument extends System, Document {
    _id: Types.ObjectId;
}

const systemSchema = new Schema<SystemDocument>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        active: {
            type: Boolean,
            required: true,
        },
        message: {
            type: String,
            required: false,
        }
    },
    config: {
        type: Schema.Types.Mixed,
        required: true,
        default: {},
    }
}, { timestamps: true });

let SystemModel: Model<SystemDocument>
try {
    SystemModel = model<SystemDocument>('system', systemSchema);
} catch (error) {
    SystemModel = model<SystemDocument>('system');
}

export { SystemModel }; // Export the model
