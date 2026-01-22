// packages/central-cli/src/doctor/checks/heartbeat.ts
import { apiClient } from "../../api/client.js";
export async function checkHeartbeat() {
    try {
        const response = await apiClient.get("/heartbeat");
        return response.alive
            ? { ok: true, message: "Heartbeat OK" }
            : { ok: false, message: "Heartbeat not received" };
    }
    catch (err) {
        return { ok: false, message: `Heartbeat check failed: ${err.message}` };
    }
}
