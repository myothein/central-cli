// packages/central-cli/src/doctor/run-doctor.ts
import { checkAuth } from "./checks/auth.js";
import { checkConfig } from "./checks/config.js";
import { checkHeartbeat } from "./checks/heartbeat.js";
import { renderCheckResults } from "./render.js";
export async function runDoctor() {
    const results = [];
    results.push({ name: "Auth", ...(await checkAuth()) });
    results.push({ name: "Config", ...(await checkConfig()) });
    results.push({ name: "Heartbeat", ...(await checkHeartbeat()) });
    renderCheckResults(results);
    // Exit code 1 if any check failed
    if (results.some(r => !r.ok))
        process.exit(1);
}
