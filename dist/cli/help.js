// packages/central-cli/src/cli/help.ts
import { Help } from "commander";
import chalk from "chalk";
/**
 * Custom CLIHelp class for central-cli
 */
export class CLIHelp extends Help {
    constructor() {
        super();
    }
    /**
     * Formats the CLI help text
     * @param cmd The current command
     * @param helper Commander Help helper
     * @returns Formatted help string
     */
    formatHelp(cmd, helper) {
        let output = "";
        // Header
        output += chalk.bold.blue(`\n${cmd.name()} CLI\n\n`);
        if (cmd.description()) {
            output += `${chalk.white(cmd.description())}\n\n`;
        }
        // Usage
        output += chalk.bold("Usage: ") + chalk.cyan(helper.commandUsage(cmd)) + "\n\n";
        // Commands
        const visibleCommands = cmd.commands
            .filter(c => !c._hidden)
            .sort((a, b) => a.name().localeCompare(b.name()));
        if (visibleCommands.length > 0) {
            output += chalk.bold("Commands:\n");
            visibleCommands.forEach(c => {
                const icon = c.icon ? chalk.blue(c.icon) + " " : "";
                const name = chalk.green(c.name().padEnd(15));
                const desc = chalk.white(c.description() || "");
                output += `  ${icon}${name} ${desc}\n`;
            });
            output += "\n";
        }
        // Options
        const options = helper.visibleOptions(cmd);
        if (options.length > 0) {
            output += chalk.bold("Options:\n");
            options.forEach(o => {
                const flags = chalk.yellow(o.flags.padEnd(25));
                const desc = chalk.white(o.description || "");
                output += `  ${flags} ${desc}\n`;
            });
            output += "\n";
        }
        // Footer
        output += chalk.gray("Use 'central <command> --help' for more details on a command.\n");
        return output;
    }
}
