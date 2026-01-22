// packages/central-cli/src/commands/agent/status.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import { renderTable } from "../../output/table.js";
import { onlineIcon, onlineLabel } from "../../output/icons.js";
import { formatRelativeTime } from "../../output/time.js";
import chalk from "chalk";
const REFRESH_INTERVAL = 5000;
export const agentStatusCommand = new Command("status")
    .description("Show agent status (online/offline, auto-refresh)")
    .option("--once", "Show agent status once and exit")
    .action(async (options) => {
    let stopped = false;
    process.on("SIGINT", () => {
        stopped = true;
        console.log(chalk.yellow("\nExiting agent status view..."));
        process.exit(0);
    });
    do {
        try {
            const agents = await apiClient.get("/agents/status");
            const rows = agents.map(a => ({
                AGENT: a.agentId,
                STATUS: a.status,
                ONLINE: `${onlineIcon(a.online)} ${onlineLabel(a.online)}`,
                "LAST SEEN": a.lastHeartbeat ? formatRelativeTime(a.lastHeartbeat) : "—",
            }));
            console.clear();
            renderTable(rows);
            if (options.once)
                break;
        }
        catch (err) {
            console.error(chalk.red("Failed to fetch agent status:"), err.message);
            if (options.once)
                process.exit(1);
        }
        if (!options.once) {
            await new Promise(r => setTimeout(r, REFRESH_INTERVAL));
        }
    } while (!stopped && !options.once);
});
