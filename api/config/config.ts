import dotenv from 'dotenv';
dotenv.config()

export const database = {
    "host": process.env.DB_HOST || "localhost",
    "user": process.env.DB_USERNAME || "username",
    "password": process.env.DB_PASSWORD || "password",
    "database": process.env.DB_DATABASE || "database",
    "port": parseInt(process.env.DB_PORT || "5432") || 5432, //PG-PORT is default 5432
};

export const mongodb = {
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/pizza-system",
}

export const constants = {
    LIFETIME_BEARER_HOURS: 8,
}

export const tokens = {
    PAYMENT_ADMIN_TOKEN: process.env.PAYMENT_ADMIN_TOKEN || "asdf",
}