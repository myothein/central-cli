// lockStatus.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import chalk from "chalk";
export const agentLockStatusCommand = new Command("status")
    .description("Show agent lock status")
    .action(async () => {
    try {
        const lockInfo = await apiClient.get("/agents/lock/status");
        console.log(lockInfo.locked
            ? chalk.red(`Agent is locked by ${lockInfo.owner}`)
            : chalk.green("Agent is not locked"));
    }
    catch (err) {
        console.error(chalk.red("Failed to get agent lock status:"), err.message);
        process.exit(1);
    }
});
