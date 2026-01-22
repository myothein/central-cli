// packages/central-cli/src/commands/tenant/resume.ts
import { Command } from "commander";
import { apiClient } from "../../api/client.js";
import chalk from "chalk";

export const tenantResumeCommand = new Command("resume")
    .description("Resume a paused tenant (resume event processing & projections)")
    .argument("<tenantId>", "Tenant ID to resume")
    .option("--dry-run", "Show what would happen without actually resuming")
    .action(async (tenantId: string, options: { dryRun?: boolean }) => {
        try {
            if (options.dryRun) {
                console.log(chalk.blue(`[Dry Run] Tenant ${tenantId} would be resumed.`));
                return;
            }

            await apiClient.post(`/tenants/${tenantId}/resume`);
            console.log(chalk.green(`Tenant ${tenantId} resumed successfully.`));
        } catch (err: any) {
            console.error(chalk.red(`Failed to resume tenant ${tenantId}:`), err.message);
            process.exit(1);
        }
    });
