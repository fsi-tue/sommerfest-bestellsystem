export const CONSTANTS = {
    SYSTEM_NAME: process.env.SYSTEM_NAME ?? "fsi",
    LIFETIME_BEARER_HOURS: parseInt(process.env.LIFETIME_BEARER_HOURS ?? "8"),
    TIMEZONE_ORDERS: 'Europe/Berlin'
}

export const MONGO_CONFIG = {
    MONGO_URI: process.env.MONGO_URI ?? "mongodb://localhost:27017/pizza-system",
}

export const TOKENS_CONFIG = {
    PAYMENT_ADMIN_TOKEN: process.env.PAYMENT_ADMIN_TOKEN,
}

export const ORDER_CONFIG = {
    MAX_ITEMS_PER_TIMESLOT: 4,
    TIMESLOT_DURATION: 10,
}

export const ITEM_CONFIG = {
    MAX_ITEMS: 40
}
