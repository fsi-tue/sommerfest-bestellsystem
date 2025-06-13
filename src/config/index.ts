export const CONSTANTS = {
    SYSTEM_NAME: process.env.SYSTEM_NAME ?? "fsi",
    LIFETIME_BEARER_HOURS: parseInt(process.env.LIFETIME_BEARER_HOURS ?? "8"),
    TIMEZONE_ORDERS: 'Europe/Berlin',
}

export const TIME_SLOT_CONFIG = {
    UPDATE_EVERY_SECONDS: 60,
    SIZE_MINUTES: 10,
    PAST_SLOTS_TO_SHOW: 5,
    FUTURE_SLOTS_TO_SHOW: 14,
    TIMESLOTS_AS_BUFFER: 3, // number of timeslots as buffer

    STATUS_COLORS: {
        OK: '#0ce504',
        WARN: '#e59604',
        CRIT: '#B33',
    },

    BORDER_STYLES: {
        DEFAULT_COLOR: '#FFF',
        CURRENT_SLOT_COLOR: '#000',
        DEFAULT_WIDTH: 0,
        CURRENT_SLOT_WIDTH: 4,
    }
};

export const ORDER_AMOUNT_THRESHOLDS = {
    WARNING: 3,
    MAX: 4,
    CRITICAL: 5,
};


export const MONGO_CONFIG = {
    MONGO_URI: process.env.MONGO_URI ?? "mongodb://localhost:27017/pizza-system",
}

export const ORDER_CONFIG = {
    TIMESLOTS_BUFFER: 40
}

export const ITEM_CONFIG = {
    MAX_ITEMS: 40
}
