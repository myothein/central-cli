import { Command } from "commander";
import { tenantListCommand } from "./list.js";
import { tenantStatusCommand } from "./status.js";
import { tenantPauseCommand } from "./pause.js";
import { tenantResumeCommand } from "./resume.js";
export const tenantCommand = new Command("tenant")
    .description("Tenant-related commands")
    .addCommand(tenantListCommand)
    .addCommand(tenantStatusCommand)
    .addCommand(tenantPauseCommand)
    .addCommand(tenantResumeCommand);
