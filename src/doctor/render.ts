// packages/central-cli/src/doctor/render.ts
import chalk from "chalk";

export function renderCheckResults(results: { name: string; ok: boolean; message: string }[]) {
    for (const r of results) {
        const status = r.ok ? chalk.green("OK") : chalk.red("FAIL");
        console.log(`${status} | ${r.name.padEnd(15)} | ${r.message}`);
    }

    const failed = results.filter(r => !r.ok).length;
    console.log(`\n${failed === 0 ? chalk.green("All checks passed ✅") : chalk.red(`${failed} checks failed ❌`)}`);
}
