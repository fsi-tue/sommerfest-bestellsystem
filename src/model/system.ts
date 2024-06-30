import { Model, model, Schema } from "mongoose";

export interface SystemDocument {
    name: string;
    status: 'active' | 'inactive' | 'maintenance';
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
