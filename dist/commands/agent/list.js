// packages/central-cli/src/commands/agent/list.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import { renderTable } from "../../output/table.js";
import chalk from "chalk";
export const agentListCommand = new Command("list")
    .description("List all agents")
    .action(async () => {
    try {
        const agents = await apiClient.get("/agents");
        if (!agents.length) {
            console.log(chalk.yellow("No agents found."));
            return;
        }
        const rows = agents.map(a => ({
            AGENT: a.agentId,
            NAME: a.name,
            STATUS: a.status,
            "LAST SEEN": a.lastHeartbeat,
        }));
        renderTable(rows);
    }
    catch (err) {
        console.error(chalk.red("Failed to fetch agent list:"), err.message);
        process.exit(1);
    }
});
