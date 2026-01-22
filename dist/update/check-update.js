// packages/central-cli/src/update/check-update.ts
import { Command } from "commander";
import chalk from "chalk";
import { checkLatestVersion } from "./latest-version.js";
export const checkUpdateCommand = new Command("check")
    .description("Check for a new CLI version")
    .action(async () => {
    try {
        const latestVersion = await checkLatestVersion();
        const currentVersion = process.env.npm_package_version || "unknown";
        if (latestVersion === currentVersion) {
            console.log(chalk.green(`You are running the latest version: ${currentVersion}`));
        }
        else {
            console.log(chalk.yellow(`New version available: ${latestVersion} (current: ${currentVersion})`));
            console.log(chalk.blue("Run 'central update apply' to update."));
        }
    }
    catch (err) {
        console.error(chalk.red("Failed to check for updates:"), err.message);
        process.exit(1);
    }
});
