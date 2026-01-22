// lockRelease.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import chalk from "chalk";

export const agentLockReleaseCommand = new Command("release")
    .description("Release agent lock")
    .option("--force", "Force release lock")
    .action(async (options: { force?: boolean }) => {
        try {
            await apiClient.post("/agents/lock/release", { force: !!options.force });
            console.log(chalk.green("Agent lock released successfully."));
        } catch (err: any) {
            console.error(chalk.red("Failed to release agent lock:"), err.message);
            process.exit(1);
        }
    });
