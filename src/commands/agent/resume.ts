// resume.ts (same structure)
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import chalk from "chalk";

export const agentResumeCommand = new Command("resume")
    .description("Resume a paused agent")
    .argument("<agentId>", "Agent ID to resume")
    .option("--dry-run", "Show what would happen without resuming")
    .action(async (agentId: string, options: { dryRun?: boolean }) => {
        try {
            if (options.dryRun) {
                console.log(chalk.blue(`[Dry Run] Agent ${agentId} would be resumed.`));
                return;
            }

            await apiClient.post(`/agents/${agentId}/resume`);
            console.log(chalk.green(`Agent ${agentId} resumed successfully.`));
        } catch (err: any) {
            console.error(chalk.red(`Failed to resume agent ${agentId}:`), err.message);
            process.exit(1);
        }
    });
