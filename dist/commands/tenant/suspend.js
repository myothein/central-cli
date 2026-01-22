import { Command } from "commander";
import { apiClient } from "../../api/client.js";
export const tenantSuspendCommand = new Command("suspend")
    .description("Suspend or resume a tenant")
    .argument("<tenantId>", "Tenant ID")
    .option("-r, --resume", "Resume the tenant instead of suspending")
    .action(async (tenantId, options) => {
    try {
        const action = options.resume ? "resume" : "suspend";
        const res = await apiClient.post(`/tenants/${tenantId}/${action}`);
        console.log(`Tenant ${tenantId} ${action}d successfully.`);
    }
    catch (err) {
        console.error(`Failed to ${options.resume ? "resume" : "suspend"} tenant:`, err.message);
    }
});
