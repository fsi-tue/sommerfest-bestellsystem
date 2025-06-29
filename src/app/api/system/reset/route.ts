// Fill the database
import { ItemModel } from "@/model/item";
import { requireAuth } from "@/lib/auth/serverAuth";
import dbConnect from "@/lib/db";
import { OrderModel } from "@/model/order";
import { SystemModel } from "@/model/system";
import { EditableConfig } from "@/model/config";
import { DEFAULT_EDITABLE_CONFIG, SYSTEM_NAME } from "@/config";
import { ItemTicketModel } from "@/model/ticket";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


let currentConfig: EditableConfig = { ...DEFAULT_EDITABLE_CONFIG };

/**
 * Loads configuration from MongoDB.
 * If no configuration is found for the SYSTEM_NAME, it creates one with default values.
 */
async function initAndLoadConfig(): Promise<EditableConfig> {
    try {
        let systemDoc = await SystemModel.findOne({ name: SYSTEM_NAME });

        if (systemDoc) {
            if (systemDoc.config && Object.keys(systemDoc.config).length > 0) {
                // Merge database config with defaults to ensure all keys are present
                // Database values will override defaults
                currentConfig = {
                    LIFETIME_BEARER_HOURS: systemDoc.config.LIFETIME_BEARER_HOURS ?? DEFAULT_EDITABLE_CONFIG.LIFETIME_BEARER_HOURS,
                    TIME_SLOT_CONFIG: {
                        ...DEFAULT_EDITABLE_CONFIG.TIME_SLOT_CONFIG,
                        ...(systemDoc.config.TIME_SLOT_CONFIG || {}),
                        STATUS_COLORS: {
                            ...DEFAULT_EDITABLE_CONFIG.TIME_SLOT_CONFIG.STATUS_COLORS,
                            ...(systemDoc.config.TIME_SLOT_CONFIG?.STATUS_COLORS || {})
                        },
                        BORDER_STYLES: {
                            ...DEFAULT_EDITABLE_CONFIG.TIME_SLOT_CONFIG.BORDER_STYLES,
                            ...(systemDoc.config.TIME_SLOT_CONFIG?.BORDER_STYLES || {})
                        }
                    },
                    ORDER_CONFIG: {
                        ...DEFAULT_EDITABLE_CONFIG.ORDER_CONFIG,
                        ...(systemDoc.config.ORDER_CONFIG || {}),
                        ORDER_AMOUNT_THRESHOLDS: {
                            ...DEFAULT_EDITABLE_CONFIG.ORDER_CONFIG.ORDER_AMOUNT_THRESHOLDS,
                            ...(systemDoc.config.ORDER_CONFIG?.ORDER_AMOUNT_THRESHOLDS || {})
                        }
                    },
                    ITEM_CONFIG: {
                        ...DEFAULT_EDITABLE_CONFIG.ITEM_CONFIG,
                        ...(systemDoc.config.ITEM_CONFIG || {})
                    }
                };
                console.log(`Configuration for system '${SYSTEM_NAME}' loaded from MongoDB.`);
            } else {
                // System document exists but has no config, so update it with defaults
                systemDoc.config = DEFAULT_EDITABLE_CONFIG;
                await systemDoc.save();
                currentConfig = { ...DEFAULT_EDITABLE_CONFIG };
                console.log(`Configuration for system '${SYSTEM_NAME}' was empty. Initialized with defaults in MongoDB.`);
            }
        } else {
            // No system document found, create a new one with default config
            await SystemModel.create({
                name: SYSTEM_NAME,
                status: { active: true, message: "System initialized with default configuration." },
                config: DEFAULT_EDITABLE_CONFIG,
            });
            currentConfig = { ...DEFAULT_EDITABLE_CONFIG };
            console.log(`No system document found for '${SYSTEM_NAME}'. Created one with default configuration.`);
        }
    } catch (error) {
        console.error(`Error loading or initializing configuration for system '${SYSTEM_NAME}':`, error);
        console.warn(`Using hardcoded default configuration for system '${SYSTEM_NAME}' due to error.`);
        currentConfig = { ...DEFAULT_EDITABLE_CONFIG };
    }
    return currentConfig;
}


const pizzasByName = {
    Salami: ["Cheese 🧀", "Salami 🍕"],
    Margherita: ["Cheese 🧀", "Cherry Tomatoes 🍅", "Basil 🌿"],
    Veggies: ["Cheese 🧀", "Mushrooms 🍄", "Onions 🧅", "Red Bell Peppers 🫑", "Tomatoes 🍅", "Olives 🫒"],
    "Margherita vegan": ["Vegan Cheese 🧀", "Cherry Tomaten 🍅", "Basil 🌿"],
    "Veggies vegan": ["Vegan Cheese 🧀", "Mushrooms 🍄", "Onions 🧅", "Red Bell Peppers 🫑", "Tomatoes 🍅", "Olives 🫒"],
};

/**
 * Initialize the system if it does not exist.
 * @constructor
 */
export async function GET() {
    await dbConnect();
    await initAndLoadConfig()
    return Response.json({ message: 'Successfully basic reconfigured system. You have to reset the database!' })
}

/**
 * Delete the database
 * @constructor
 */
export async function POST() {
    await dbConnect();
    await requireAuth();

    await ItemModel.deleteMany({})
    await OrderModel.deleteMany({})
    await ItemTicketModel.deleteMany({})
    await SystemModel.deleteMany({})

    // Add pizzas
    const pizzas = [
        {
            name: 'Salami half',
            price: 4,
            dietary: 'meat',
            type: 'pizza',
            ingredients: pizzasByName['Salami'],
            size: 0.5
        },
        { name: 'Margherita half', price: 6, type: 'pizza', ingredients: pizzasByName['Margherita'], size: 0.5 },
        { name: 'Veggies half', price: 6, type: 'pizza', ingredients: pizzasByName['Veggies'], size: 0.5 },
        {
            name: 'Margherita vegan half',
            price: 3,
            dietary: 'vegan',
            type: 'pizza',
            ingredients: pizzasByName['Margherita vegan'],
            size: 0.5
        },
        {
            name: 'Veggies vegan half',
            price: 3,
            dietary: 'vegan',
            type: 'pizza',
            ingredients: pizzasByName['Veggies vegan'],
            size: 0.5
        },
    ];
    for (const pizza of pizzas) {
        await new ItemModel(pizza).save();
    }

    await initAndLoadConfig()

    return Response.json({ message: 'Successfully reconfigured system' })
}
