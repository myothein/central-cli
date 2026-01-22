// pause.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import chalk from "chalk";
export const projectionPauseCommand = new Command("pause")
    .description("Pause a projection")
    .argument("<projectionId>", "Projection ID to pause")
    .option("--dry-run", "Show what would happen without pausing")
    .action(async (projectionId, options) => {
    try {
        if (options.dryRun) {
            console.log(chalk.blue(`[Dry Run] Projection ${projectionId} would be paused.`));
            return;
        }
        await apiClient.post(`/projections/${projectionId}/pause`);
        console.log(chalk.green(`Projection ${projectionId} paused successfully.`));
    }
    catch (err) {
        console.error(chalk.red(`Failed to pause projection ${projectionId}:`), err.message);
        process.exit(1);
    }
});
