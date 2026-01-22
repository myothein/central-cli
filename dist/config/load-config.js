// packages/central-cli/src/config/load-config.ts
export function loadConfig() {
    return {
        centralApiUrl: process.env.CENTRAL_API_URL || "http://localhost:5000/api",
        apiKey: process.env.CENTRAL_API_KEY || undefined,
    };
}
