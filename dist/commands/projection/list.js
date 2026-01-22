// packages/central-cli/src/commands/projection/list.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import { renderTable } from "../../output/table.js";
import chalk from "chalk";
export const projectionListCommand = new Command("list")
    .description("List all projections")
    .action(async () => {
    try {
        const projections = await apiClient.get("/projections");
        if (!projections.length) {
            console.log(chalk.yellow("No projections found."));
            return;
        }
        const rows = projections.map(p => ({
            PROJECTION: p.projectionId,
            NAME: p.name,
            STATUS: p.status,
            "LAST PROCESSED": p.lastProcessedAt ?? "—",
            PENDING: p.pendingEvents,
        }));
        renderTable(rows);
    }
    catch (err) {
        console.error(chalk.red("Failed to fetch projections:"), err.message);
        process.exit(1);
    }
});
