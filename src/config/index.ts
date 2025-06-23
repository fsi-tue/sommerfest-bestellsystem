import { EditableConfig, ItemConfig, OrderConfig, TimeSlotConfig } from "@/model/config";

export const SYSTEM_NAME: string = process.env.SYSTEM_NAME ?? "fsi";
export const MONGO_URI: string = process.env.MONGO_URI ?? "mongodb://localhost:27017/pizza-system";

const DEFAULT_LIFETIME_BEARER_HOURS: number = parseInt(process.env.LIFETIME_BEARER_HOURS ?? "8");

const DEFAULT_TIME_SLOT_CONFIG: TimeSlotConfig = {
    UPDATE_EVERY_SECONDS: 60,
    SIZE_MINUTES: 20,
    PAST_SLOTS_TO_SHOW: 5,
    FUTURE_SLOTS_TO_SHOW: 12,
    TIMESLOTS_AS_BUFFER: 3,
    STATUS_COLORS: {
        OK: '#0ce504',
        WARN: '#e59604',
        CRIT: '#B33',
        SELECT: '#7b7be1',
    },
    BORDER_STYLES: {
        DEFAULT_COLOR: '#FFF',
        CURRENT_SLOT_COLOR: '#000',
        DEFAULT_WIDTH: 0,
        CURRENT_SLOT_WIDTH: 4,
    }
};

const DEFAULT_ORDER_CONFIG: OrderConfig = {
    TIMESLOTS_BUFFER: 40,
    ORDER_AMOUNT_THRESHOLDS: {
        WARNING: 3,
        MAX: 4,
        CRITICAL: 5,
    }
};

const DEFAULT_ITEM_CONFIG: ItemConfig = {
    MAX_ITEMS: 40
};

export const DEFAULT_EDITABLE_CONFIG: EditableConfig = {
    LIFETIME_BEARER_HOURS: DEFAULT_LIFETIME_BEARER_HOURS,
    TIME_SLOT_CONFIG: DEFAULT_TIME_SLOT_CONFIG,
    ORDER_CONFIG: DEFAULT_ORDER_CONFIG,
    ITEM_CONFIG: DEFAULT_ITEM_CONFIG,
};
