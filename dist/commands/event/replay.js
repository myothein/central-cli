// replay.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import chalk from "chalk";
export const eventReplayCommand = new Command("replay")
    .description("Replay events for a tenant")
    .argument("<tenantId>", "Tenant ID to replay events for")
    .option("--from <timestamp>", "Replay events starting from timestamp")
    .option("--to <timestamp>", "Replay events until timestamp")
    .option("--dry-run", "Show what would happen without replaying")
    .action(async (tenantId, options) => {
    try {
        if (options.dryRun) {
            console.log(chalk.blue(`[Dry Run] Events for tenant ${tenantId} would be replayed` +
                (options.from ? ` from ${options.from}` : "") +
                (options.to ? ` to ${options.to}` : "")));
            return;
        }
        await apiClient.post(`/events/${tenantId}/replay`, {
            from: options.from,
            to: options.to
        });
        console.log(chalk.green(`Event replay for tenant ${tenantId} started.`));
    }
    catch (err) {
        console.error(chalk.red(`Failed to replay events for tenant ${tenantId}:`), err.message);
        process.exit(1);
    }
});
