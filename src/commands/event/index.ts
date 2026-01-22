import { Command } from "commander";
import { eventListCommand } from "./list.js";
import { eventStatusCommand } from "./status.js";
import { eventPauseCommand } from "./pause.js";
import { eventResumeCommand } from "./resume.js";
import { eventReplayCommand } from "./replay.js";

export const eventCommand = new Command("event")
    .description("Event-related commands")
    .addCommand(eventListCommand)
    .addCommand(eventStatusCommand)
    .addCommand(eventPauseCommand)
    .addCommand(eventResumeCommand)
    .addCommand(eventReplayCommand);
