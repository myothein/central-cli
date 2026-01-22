// packages/central-cli/src/commands/tenant/pause.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import chalk from "chalk";

export const tenantPauseCommand = new Command("pause")
    .description("Pause a tenant (stop event processing & projections)")
    .argument("<tenantId>", "Tenant ID to pause")
    .option("--dry-run", "Show what would happen without actually pausing")
    .action(async (tenantId: string, options: { dryRun?: boolean }) => {
        try {
            if (options.dryRun) {
                console.log(chalk.blue(`[Dry Run] Tenant ${tenantId} would be paused.`));
                return;
            }

            await apiClient.post(`/tenants/${tenantId}/pause`);
            console.log(chalk.green(`Tenant ${tenantId} paused successfully.`));
        } catch (err: any) {
            console.error(chalk.red(`Failed to pause tenant ${tenantId}:`), err.message);
            process.exit(1);
        }
    });
