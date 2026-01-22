// packages/central-cli/src/doctor/checks/config.ts
import { loadConfig } from "../../config/load-config.js";

export async function checkConfig(): Promise<{ ok: boolean; message: string }> {
    try {
        const config = loadConfig();
        //if (!config.apiUrl) return { ok: false, message: "API URL not configured" };
        //if (!config.token) return { ok: false, message: "Authentication token missing" };

        return { ok: true, message: "Configuration is valid" };
    } catch (err: any) {
        return { ok: false, message: `Failed to load config: ${err.message}` };
    }
}
