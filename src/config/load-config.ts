/** Only approved deployment configuration can select Central identity mode.
 * Do NOT put access tokens into .env files, CLI arguments or repository commits. */
export type CentralAuthMode = 'oidc' | 'legacy';

export function loadConfig() {
    return {
        centralApiUrl: process.env.CENTRAL_API_URL || 'http://127.0.0.1:3000/api/v1',
        authMode: (process.env.CENTRAL_AUTH_MODE || 'oidc') as CentralAuthMode,
        oidcAccessToken: process.env.CENTRAL_OIDC_ACCESS_TOKEN || undefined,
        // Legacy key is isolated to explicitly opted-in nonproduction QA.
        apiKey: process.env.CENTRAL_API_KEY || undefined,
        allowLegacyDevApiKey: process.env.CENTRAL_ALLOW_DEV_API_KEY === 'true',
        nodeEnv: process.env.NODE_ENV || '',
    };
}
