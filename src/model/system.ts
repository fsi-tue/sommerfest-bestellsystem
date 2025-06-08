import { Model, model, Schema } from "mongoose";

export type SystemStatus = 'active' | 'inactive' | 'maintenance';

export interface SystemDocument {
    name: string;
    status: SystemStatus;
}

const systemSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        required: true,
        default: 'active',
        enum: ['active', 'inactive', 'maintenance']
    }
});

let System: Model<SystemDocument>;
try {
    System = model<SystemDocument>('system', systemSchema);
} catch (error) {
    System = model<SystemDocument>('system');
}

export { System }
