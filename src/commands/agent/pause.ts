// pause.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import chalk from "chalk";

export const agentPauseCommand = new Command("pause")
    .description("Pause an agent (stop event processing)")
    .argument("<agentId>", "Agent ID to pause")
    .option("--dry-run", "Show what would happen without pausing")
    .action(async (agentId: string, options: { dryRun?: boolean }) => {
        try {
            if (options.dryRun) {
                console.log(chalk.blue(`[Dry Run] Agent ${agentId} would be paused.`));
                return;
            }

            await apiClient.post(`/agents/${agentId}/pause`);
            console.log(chalk.green(`Agent ${agentId} paused successfully.`));
        } catch (err: any) {
            console.error(chalk.red(`Failed to pause agent ${agentId}:`), err.message);
            process.exit(1);
        }
    });

