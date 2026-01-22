// packages/central-cli/src/doctor/index.ts
import { Command } from "commander";
import { runDoctor } from "./run-doctor.js";

export const doctorCommand = new Command("doctor")
    .description("Run health checks and diagnostics")
    .action(async () => {
        await runDoctor();
    });
