import mongoose from "mongoose";
import { MONGO_CONFIG } from "@/config";

declare global {
    var mongoose: any
}

let MONGODB_URI: string = process.env.MONGO_URI ?? MONGO_CONFIG.MONGO_URI;
if (!MONGODB_URI || MONGODB_URI === '') {
    throw new Error(
        "Please define the MONGO_URI environment variable inside .env.local",
    );
}

let cached = global.mongoose;

cached ??= global.mongoose = { conn: null, promise: null };

async function dbConnect() {
    // Return existing connection if available
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,

            // Connection pool settings
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 2,  // Maintain minimum 2 connections

            // Timeout settings
            serverSelectionTimeoutMS: 1000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            connectTimeoutMS: 10000, // Give up initial connection after 10 seconds

            // Heartbeat settings
            heartbeatFrequencyMS: 10000, // Send heartbeat every 10 seconds

            // Additional performance settings
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            compressors: 'zlib',

            // Retry settings
            retryWrites: true,
            retryReads: true,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ MongoDB Connected Successfully');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('❌ MongoDB Connection Error:', e);
        throw e;
    }

    return cached.conn;
}

// Add connection event listeners for better monitoring
if (typeof window === 'undefined') {
    mongoose.connection.on('connected', () => {
        console.log('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('🔌 Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('🛑 MongoDB connection closed through app termination');
        process.exit(0);
    });
}

export default dbConnect;
