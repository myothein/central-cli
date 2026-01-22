// packages/central-cli/src/update/apply.ts
import { Command } from "commander";
import chalk from "chalk";
import { checkLatestVersion } from "./latest-version.js";
import { autoUpdate } from "./auto-update.js";

export const applyUpdateCommand = new Command("apply")
    .description("Apply the latest CLI update")
    .action(async () => {
        try {
            const latestVersion = await checkLatestVersion();
            const currentVersion = process.env.npm_package_version || "unknown";

            if (latestVersion === currentVersion) {
                console.log(chalk.green(`You are already running the latest version: ${currentVersion}`));
                return;
            }

            console.log(chalk.blue(`Updating CLI from version ${currentVersion} to ${latestVersion}...`));
            await autoUpdate(latestVersion);
            console.log(chalk.green("Update applied successfully. Please restart the CLI."));
        } catch (err: any) {
            console.error(chalk.red("Failed to apply update:"), err.message);
            process.exit(1);
        }
    });
