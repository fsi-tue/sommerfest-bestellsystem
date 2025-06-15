export interface TimeSlotConfig {
    UPDATE_EVERY_SECONDS: number;
    SIZE_MINUTES: number;
    PAST_SLOTS_TO_SHOW: number;
    FUTURE_SLOTS_TO_SHOW: number;
    TIMESLOTS_AS_BUFFER: number;
    STATUS_COLORS: {
        OK: string;
        WARN: string;
        CRIT: string;
        SELECT: string;
    };
    BORDER_STYLES: {
        DEFAULT_COLOR: string;
        CURRENT_SLOT_COLOR: string;
        DEFAULT_WIDTH: number;
        CURRENT_SLOT_WIDTH: number;
    };
}

export interface OrderConfig {
    TIMESLOTS_BUFFER: number;
    ORDER_AMOUNT_THRESHOLDS: {
        WARNING: number;
        MAX: number;
        CRITICAL: number;
    };
}

export interface ItemConfig {
    MAX_ITEMS: number;
}

export interface EditableConfig {
    LIFETIME_BEARER_HOURS: number;
    TIME_SLOT_CONFIG: TimeSlotConfig;
    ORDER_CONFIG: OrderConfig;
    ITEM_CONFIG: ItemConfig;
}
