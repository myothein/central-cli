// packages/central-cli/src/update/latest-version.ts
import fetch from "node-fetch";
export async function checkLatestVersion() {
    const registryUrl = "https://registry.npmjs.org/central-cli/latest";
    const res = await fetch(registryUrl);
    if (!res.ok)
        throw new Error(`Failed to fetch latest version: ${res.statusText}`);
    const data = await res.json();
    return ""; //data.version;
}
