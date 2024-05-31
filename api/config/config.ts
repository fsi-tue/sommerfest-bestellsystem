import dotenv from 'dotenv';
dotenv.config()

export const database = {
    "host": process.env.DB_HOST || "localhost",
    "user": process.env.DB_USERNAME || "username",
    "password": process.env.DB_PASSWORD || "password",
    "database": process.env.DB_DATABASE || "pizza_system_database",
    "port": parseInt(process.env.DB_PORT || "5432") || 5432, //PG-PORT is default 5432
};

export const constants = {
    LIFETIME_BEARER_HOURS: 8,
}