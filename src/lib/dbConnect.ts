import mongoose from "mongoose";
import { MONGO_CONFIG } from "@/config";

declare global {
    var mongoose: any
}

let MONGODB_URI: string = process.env.MONGO_URI  || MONGO_CONFIG.MONGO_URI
if (!MONGODB_URI || MONGODB_URI === '') {
    throw new Error(
        "Please define the MONGO_URI environment variable inside .env.local",
    );
}
console.log('MONGODB_URI', MONGODB_URI)

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local",
    );
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
