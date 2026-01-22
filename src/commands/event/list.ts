// packages/central-cli/src/commands/event/list.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import { renderTable } from "../../output/table.js";
import chalk from "chalk";

interface EventInfo {
    eventId: string;
    tenantId: string;
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    createdAt: string;
    status: "PENDING" | "PROCESSED" | "FAILED";
}

export const eventListCommand = new Command("list")
    .description("List all events")
    .action(async () => {
        try {
            const events: EventInfo[] = await apiClient.get("/events");

            if (!events.length) {
                console.log(chalk.yellow("No events found."));
                return;
            }

            const rows = events.map(e => ({
                EVENT: e.eventId,
                TENANT: e.tenantId,
                TYPE: e.eventType,
                AGGREGATE: `${e.aggregateType}:${e.aggregateId}`,
                STATUS: e.status,
                CREATED_AT: e.createdAt,
            }));

            renderTable(rows);
        } catch (err: any) {
            console.error(chalk.red("Failed to fetch events:"), err.message);
            process.exit(1);
        }
    });
