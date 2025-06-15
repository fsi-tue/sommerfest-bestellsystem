import { type Document, Model, model, Schema } from "mongoose"
import { DEFAULT_EDITABLE_CONFIG } from "@/config";

export interface SessionDocument extends Document {
    userId: string;
    token: string;
    expiresAt: Date;
}

const sessionSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique: false
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: DEFAULT_EDITABLE_CONFIG.LIFETIME_BEARER_HOURS * 60 * 60
    }
});

let Session: Model<SessionDocument>;
try {
    Session = model<SessionDocument>('session', sessionSchema);
} catch (error) {
    Session = model<SessionDocument>('session');
}

export { Session }
