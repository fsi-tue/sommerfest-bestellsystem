export const mongodb = {
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/pizza-system",
}

export const constants = {
    SYSTEM_NAME: process.env.SYSTEM_NAME || "fsi",
    LIFETIME_BEARER_HOURS: parseInt(process.env.LIFETIME_BEARER_HOURS || "8"),
    TIMEZONE_ORDERS: 'Europe/Berlin'
}

export const tokens = {
    PAYMENT_ADMIN_TOKEN: process.env.PAYMENT_ADMIN_TOKEN,
}

export const ORDER = {
    MAX_ITEMS_PER_TIMESLOT: 5,
}

export const FOOD = {
    MAX_ITEMS: 40
}
