import { Command } from "commander";
import { renderTable } from "../../output/table.js";
import { apiClient } from "../../api/client.js";

// Tenant list interface
interface TenantInfo {
    tenantId: string;
    name: string;
    status: string;
    createdAt: string;
}

export const tenantListCommand = new Command("list")
    .description("List all tenants")
    .action(async () => {
        try {
            const tenants: TenantInfo[] = await apiClient.get("/tenants");

            const rows = tenants.map((t) => ({
                TENANT: t.tenantId,
                NAME: t.name,
                STATUS: t.status,
                CREATED_AT: t.createdAt,
            }));

            renderTable(rows);
        } catch (err: any) {
            console.error("Failed to fetch tenant list:", err.message);
        }
    });
