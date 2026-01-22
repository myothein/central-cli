// resume.ts
import { Command } from "commander";
import chalk from "chalk";
import { apiClient } from "../../api/client.js";
export const eventResumeCommand = new Command("resume")
    .description("Resume event processing")
    .argument("<tenantId>", "Tenant ID for which to resume events")
    .option("--dry-run", "Show what would happen without resuming")
    .action(async (tenantId, options) => {
    try {
        if (options.dryRun) {
            console.log(chalk.blue(`[Dry Run] Event processing for tenant ${tenantId} would be resumed.`));
            return;
        }
        await apiClient.post(`/events/${tenantId}/resume`);
        console.log(chalk.green(`Event processing for tenant ${tenantId} resumed.`));
    }
    catch (err) {
        console.error(chalk.red(`Failed to resume events for tenant ${tenantId}:`), err.message);
        process.exit(1);
    }
});
