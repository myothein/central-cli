// resume.ts
import {Command} from "commander";
import chalk from "chalk";
import {apiClient} from "../../api/client.js";

export const projectionResumeCommand = new Command("resume")
    .description("Resume a paused projection")
    .argument("<projectionId>", "Projection ID to resume")
    .option("--dry-run", "Show what would happen without resuming")
    .action(async (projectionId: string, options: { dryRun?: boolean }) => {
        try {
            if (options.dryRun) {
                console.log(chalk.blue(`[Dry Run] Projection ${projectionId} would be resumed.`));
                return;
            }

            await apiClient.post(`/projections/${projectionId}/resume`);
            console.log(chalk.green(`Projection ${projectionId} resumed successfully.`));
        } catch (err: any) {
            console.error(chalk.red(`Failed to resume projection ${projectionId}:`), err.message);
            process.exit(1);
        }
    });
