import { Command } from "commander";
import { renderTable } from "../../output/table.js";
import { onlineIcon, onlineLabel } from "../../output/icons.js";
import { formatRelativeTime } from "../../output/time.js";
import { apiClient } from "../../api/client.js";
import chalk from "chalk";
const REFRESH_INTERVAL = 5000; // 5 seconds
export const tenantStatusCommand = new Command("status")
    .description("Show tenant status (online/offline)")
    .option("--once", "Show tenant status once and exit")
    .action(async (options) => {
    let stopped = false;
    // Handle Ctrl+C cleanly
    process.on("SIGINT", () => {
        stopped = true;
        console.log(chalk.yellow("\nExiting tenant status view..."));
        process.exit(0);
    });
    do {
        try {
            const tenants = await apiClient.get("/tenants/status");
            const rows = tenants.map(t => ({
                TENANT: t.tenantId,
                STATUS: t.status,
                ONLINE: `${onlineIcon(t.online)} ${onlineLabel(t.online)}`,
                "LAST SEEN": t.lastHeartbeat ? formatRelativeTime(t.lastHeartbeat) : "—",
            }));
            console.clear();
            renderTable(rows);
            if (options.once)
                break;
        }
        catch (err) {
            console.error(chalk.red("Failed to fetch tenant status:"), err.message);
            if (options.once)
                process.exit(1);
        }
        // Wait before next refresh
        if (!options.once) {
            await new Promise(r => setTimeout(r, REFRESH_INTERVAL));
        }
    } while (!stopped && !options.once);
});
