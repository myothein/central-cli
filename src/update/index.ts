import { Command } from "commander";
import { checkUpdateCommand } from "./check-update.js";
import { applyUpdateCommand } from "./apply.js";

export const updateCommand = new Command("update")
    .description("Check for and apply CLI updates")
    .addCommand(checkUpdateCommand)
    .addCommand(applyUpdateCommand);
