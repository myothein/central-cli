import { Command } from "commander";
import { projectionListCommand } from "./list.js";
import { projectionStatusCommand } from "./status.js";
import { projectionPauseCommand } from "./pause.js";
import { projectionResumeCommand } from "./resume.js";
export const projectionCommand = new Command("projection")
    .description("Projection-related commands")
    .addCommand(projectionListCommand)
    .addCommand(projectionStatusCommand)
    .addCommand(projectionPauseCommand)
    .addCommand(projectionResumeCommand);
