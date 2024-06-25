export const mongodb = {
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/pizza-system",
}

export const constants = {
    LIFETIME_BEARER_HOURS: parseInt(process.env.LIFETIME_BEARER_HOURS || "8"),
    ENABLE_DB_FILLING: process.env.ENABLE_DB_FILLING ?? false,
    TIMEZONE_ORDERS: process.env.TIMEZONE_ORDERS || 'Europe/Berlin'
}

export const tokens = {
    PAYMENT_ADMIN_TOKEN: process.env.PAYMENT_ADMIN_TOKEN,
}
