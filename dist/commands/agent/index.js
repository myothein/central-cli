import { Command } from "commander";
import { agentListCommand } from "./list.js";
import { agentStatusCommand } from "./status.js";
import { agentPauseCommand } from "./pause.js";
import { agentResumeCommand } from "./resume.js";
import { agentLockStatusCommand } from "./lock-status.js";
import { agentLockReleaseCommand } from "./lock-release.js";
export const agentCommand = new Command("agent")
    .description("Agent-related commands")
    .addCommand(agentListCommand)
    .addCommand(agentStatusCommand)
    .addCommand(agentPauseCommand)
    .addCommand(agentResumeCommand)
    .command("lock")
    .description("Agent lock commands")
    .addCommand(agentLockStatusCommand)
    .addCommand(agentLockReleaseCommand);
