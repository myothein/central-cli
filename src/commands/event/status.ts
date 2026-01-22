// packages/central-cli/src/commands/event/status.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import { renderTable } from "../../output/table.js";
import { formatRelativeTime } from "../../output/time.js";
import chalk from "chalk";

interface EventProcessorStatus {
    tenantId: string;
    pending: number;
    lastProcessedAt: string | null;
    status: "RUNNING" | "PAUSED" | "FAILED";
}

const REFRESH_INTERVAL = 5000;

export const eventStatusCommand = new Command("status")
    .description("Show event processor status per tenant (auto-refresh)")
    .option("--once", "Show status once and exit")
    .action(async (options: { once?: boolean }) => {
        let stopped = false;

        process.on("SIGINT", () => {
            stopped = true;
            console.log(chalk.yellow("\nExiting event status view..."));
            process.exit(0);
        });

        do {
            try {
                const statusList: EventProcessorStatus[] = await apiClient.get("/events/status");

                const rows = statusList.map(s => ({
                    TENANT: s.tenantId,
                    STATUS: s.status,
                    PENDING: s.pending,
                    "LAST PROCESSED": s.lastProcessedAt ? formatRelativeTime(s.lastProcessedAt) : "—",
                }));

                console.clear();
                renderTable(rows);

                if (options.once) break;
            } catch (err: any) {
                console.error(chalk.red("Failed to fetch event status:"), err.message);
                if (options.once) process.exit(1);
            }

            if (!options.once) await new Promise(r => setTimeout(r, REFRESH_INTERVAL));
        } while (!stopped && !options.once);
    });
