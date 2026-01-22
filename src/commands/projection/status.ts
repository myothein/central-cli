// packages/central-cli/src/commands/projection/status.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import { renderTable } from "../../output/table.js";
import { formatRelativeTime } from "../../output/time.js";
import chalk from "chalk";

interface ProjectionStatus {
    projectionId: string;
    name: string;
    status: "RUNNING" | "PAUSED" | "FAILED";
    lastProcessedAt: string | null;
    pendingEvents: number;
}

const REFRESH_INTERVAL = 5000;

export const projectionStatusCommand = new Command("status")
    .description("Show projection status (auto-refresh)")
    .option("--once", "Show projection status once and exit")
    .action(async (options: { once?: boolean }) => {
        let stopped = false;

        process.on("SIGINT", () => {
            stopped = true;
            console.log(chalk.yellow("\nExiting projection status view..."));
            process.exit(0);
        });

        do {
            try {
                const projections: ProjectionStatus[] = await apiClient.get("/projections/status");

                const rows = projections.map(p => ({
                    PROJECTION: p.projectionId,
                    NAME: p.name,
                    STATUS: p.status,
                    "LAST PROCESSED": p.lastProcessedAt ? formatRelativeTime(p.lastProcessedAt) : "—",
                    PENDING: p.pendingEvents,
                }));

                console.clear();
                renderTable(rows);

                if (options.once) break;
            } catch (err: any) {
                console.error(chalk.red("Failed to fetch projection status:"), err.message);
                if (options.once) process.exit(1);
            }

            if (!options.once) await new Promise(r => setTimeout(r, REFRESH_INTERVAL));
        } while (!stopped && !options.once);
    });
