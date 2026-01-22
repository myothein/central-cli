#!/usr/bin/env node
import "dotenv/config"; // Load environment variables first
import chalk from "chalk";
import { Command } from "commander";
import { getCommandRegistry } from "./cli/command-registry.js";
import { CLIHelp } from "./cli/help.js";
// Load version from package.json
import * as pkg from "../package.json" with { type: "json" };
// Create CLI program
const program = new Command();
// ----------------------
// CLI Metadata
// ----------------------
program
    .name("central")
    .description("Central CLI for multi-tenant management")
    .version(pkg.default.version);
// ----------------------
// Custom Help
// ----------------------
program.configureHelp({
    formatHelp: (cmd, helper) => new CLIHelp().formatHelp(cmd, helper),
    helpWidth: 80,
    sortSubcommands: true,
});
// ----------------------
// Register domain commands
// ----------------------
for (const cmd of getCommandRegistry()) {
    program.addCommand(cmd);
}
// ----------------------
// Show help if no arguments
// ----------------------
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
// ----------------------
// Parse CLI arguments safely
// ----------------------
try {
    await program.parseAsync(process.argv);
}
catch (err) {
    if (err instanceof Error) {
        console.error(chalk.red("ERROR:"), err.message);
    }
    else {
        console.error(chalk.red("ERROR:"), err);
    }
    process.exit(1);
}
