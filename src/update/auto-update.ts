// packages/central-cli/src/update/auto-update.ts
import { exec } from "child_process";

export async function autoUpdate(version: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const cmd = `npm install -g central-cli@${version}`;
        const child = exec(cmd, (err, stdout, stderr) => {
            if (err) return reject(err);
            resolve();
        });
        child.stdout?.pipe(process.stdout);
        child.stderr?.pipe(process.stderr);
    });
}
