// pause.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import chalk from "chalk";

export const eventPauseCommand = new Command("pause")
    .description("Pause event processing")
    .argument("<tenantId>", "Tenant ID for which to pause events")
    .option("--dry-run", "Show what would happen without pausing")
    .action(async (tenantId: string, options: { dryRun?: boolean }) => {
        try {
            if (options.dryRun) {
                console.log(chalk.blue(`[Dry Run] Event processing for tenant ${tenantId} would be paused.`));
                return;
            }

            await apiClient.post(`/events/${tenantId}/pause`);
            console.log(chalk.green(`Event processing for tenant ${tenantId} paused.`));
        } catch (err: any) {
            console.error(chalk.red(`Failed to pause events for tenant ${tenantId}:`), err.message);
            process.exit(1);
        }
    });
