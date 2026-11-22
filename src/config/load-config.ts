/** Safe local-development default; any remote Central API must use HTTPS. */
export function loadConfig() {
    return {
        centralApiUrl: process.env.CENTRAL_API_URL || 'http://127.0.0.1:3000/api/v1',
        apiKey: process.env.CENTRAL_API_KEY || undefined,
    };
}
