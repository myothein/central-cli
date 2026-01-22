// packages/central-cli/src/doctor/checks/auth.ts
import { apiClient } from "../../api/client.js";

export async function checkAuth(): Promise<{ ok: boolean; message: string }> {
    try {
        await apiClient.get("/auth/check");
        return { ok: true, message: "Authentication is valid" };
    } catch (err: any) {
        return { ok: false, message: `Authentication failed: ${err.message}` };
    }
}
