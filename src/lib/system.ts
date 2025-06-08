import { CONSTANTS } from "@/config";
import { System } from "@/model/system";

export async function getSystemStatus() {
    const system = await System.findOne({ name: CONSTANTS.SYSTEM_NAME }).lean();
    if (!system) {
        throw new Error('System not found');
    }

    return system.status;
}

export async function requireActiveSystem() {
    if (await getSystemStatus() !== 'active') {
        throw new Error('System is not active');
    }
    return true;
}
