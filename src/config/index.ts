export const constants = {
    SYSTEM_NAME: process.env.SYSTEM_NAME || "fsi",
    LIFETIME_BEARER_HOURS: parseInt(process.env.LIFETIME_BEARER_HOURS || "8"),
    TIMEZONE_ORDERS: 'Europe/Berlin'
}

export const mongo = {
    MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/pizza-system",
}

export const tokens = {
    PAYMENT_ADMIN_TOKEN: process.env.PAYMENT_ADMIN_TOKEN,
}

export const ORDER = {
    MAX_ITEMS_PER_TIMESLOT: 4,
    TIMESLOT_DURATION: 10,
}

export const FOOD = {
    MAX_ITEMS: 40
}
