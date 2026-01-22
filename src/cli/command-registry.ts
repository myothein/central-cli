// packages/central-cli/src/cli/command-registry.ts
import { Command } from "commander";

// Import all commands
import { tenantCommand } from "../commands/tenant/index.js";
import { agentCommand } from "../commands/agent/index.js";
import { eventCommand } from "../commands/event/index.js";
import { projectionCommand } from "../commands/projection/index.js";
import { updateCommand } from "../update/index.js";
import { doctorCommand } from "../doctor/index.js";
import { agentLockReleaseCommand } from "../commands/agent/lock-release.js"; // if you have a lock subdomain
import { agentLockStatusCommand } from "../commands/agent/lock-status.js";
export function getCommandRegistry(): Command[] {
    return [
        tenantCommand,
        agentCommand,
        agentLockStatusCommand,
        agentLockReleaseCommand, // optional
        eventCommand,
        projectionCommand,
        updateCommand,
        doctorCommand,
    ];
}
