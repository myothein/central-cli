import { loadConfig } from '../config/load-config.js';

export type ApiConfiguration = {
    centralApiUrl: string;
    authMode?: 'oidc' | 'legacy';
    oidcAccessToken?: string;
    apiKey?: string;
    allowLegacyDevApiKey?: boolean;
};

/** Validated Central v1 API client; never logs bearer credentials or response bodies. */
export class ApiClient {
    private readonly baseUrl: string;
    private readonly authMode: 'oidc' | 'legacy';
    private readonly oidcAccessToken?: string;
    private readonly apiKey?: string;
    private readonly allowLegacyDevApiKey: boolean;

    constructor(config: ApiConfiguration = loadConfig()) {
        let url: URL;
        try { url = new URL(config.centralApiUrl); }
        catch { throw new Error('CENTRAL_API_URL is not a valid absolute URL'); }
        const allowedLocal = ['localhost', '127.0.0.1', '[::1]', '::1'];
        if (!['https:', 'http:'].includes(url.protocol) ||
            (url.protocol === 'http:' && !allowedLocal.includes(url.hostname)) ||
            url.username || url.password || url.search || url.hash ||
            url.pathname.replace(/\/+$/, '') !== '/api/v1') {
            throw new Error('CENTRAL_API_URL must use HTTPS (except loopback) and end in /api/v1');
        }
        this.baseUrl = url.origin + '/api/v1';
        const mode = config.authMode ?? 'oidc';
        if (mode !== 'oidc' && mode !== 'legacy') {
            throw new Error('Invalid CENTRAL_AUTH_MODE');
        }
        this.authMode = mode;
        this.oidcAccessToken = config.oidcAccessToken;
        this.apiKey = config.apiKey;
        this.allowLegacyDevApiKey = config.allowLegacyDevApiKey === true;
    }

    private async request<T>(route: string, options: RequestInit = {}): Promise<T> {
        if (!/^\/[a-zA-Z0-9/_-]+$/.test(route) || route.includes('//') ||
            route.includes('..')) {
            throw new Error('Invalid Central API route');
        }
        let credential: string;
        if (this.authMode === 'oidc') {
            const token = this.oidcAccessToken;
            // This is structural input hygiene, NOT token verification.
            // Central Service alone validates issuer/JWKS, audience, expiry and realm role.
            if (!token || token.length > 16_384 ||
                !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) {
                throw new Error('CENTRAL_OIDC_ACCESS_TOKEN missing or malformed');
            }
            credential = token;
        } else {
            // Prevent shared-key Central access in production, even if opted in.
            if (!this.allowLegacyDevApiKey ||
                !['test', 'development'].includes(process.env.NODE_ENV || '') ||
                !this.apiKey || Buffer.byteLength(this.apiKey, 'utf8') < 32) {
                throw new Error('Legacy Central API credentials disabled');
            }
            credential = this.apiKey;
        }
        const headers = new Headers(options.headers);
        headers.set('authorization', 'Bearer ' + credential);
        headers.set('accept', 'application/json');
        headers.set('content-type', 'application/json');

        const abort = new AbortController();
        const timeout = setTimeout(() => abort.abort(), 10_000);
        try {
            const response = await fetch(this.baseUrl + route, {
                ...options, headers, signal: abort.signal
            });
            if (!response.ok) {
                // Remote responses may contain sensitive information: never log their body.
                throw new Error('Central API returned HTTP ' + response.status);
            }
            let parsed: unknown;
            try { parsed = await response.json(); }
            catch { throw new Error('Central API returned invalid JSON'); }
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
                !('success' in parsed) || (parsed as { success: unknown }).success !== true ||
                !('data' in parsed)) {
                throw new Error('Central API returned an invalid response envelope');
            }
            return (parsed as { data: T }).data;
        } catch (error) {
            if (abort.signal.aborted) throw new Error('Central API request timed out');
            if (error instanceof Error && error.message.startsWith('Central API')) {
                throw error;
            }
            throw new Error('Central API connection failed');
        } finally { clearTimeout(timeout); }
    }

    get<T = unknown>(path: string): Promise<T> {
        return this.request<T>(path, {method:'GET'});
    }
    post<T = unknown>(path: string, body?: unknown): Promise<T> {
        return this.request<T>(path, {
            method:'POST', ...(body === undefined ? {} : {body:JSON.stringify(body)})
        });
    }
    put<T = unknown>(path: string, body?: unknown): Promise<T> {
        return this.request<T>(path, {
            method:'PUT', ...(body === undefined ? {} : {body:JSON.stringify(body)})
        });
    }
    delete<T = unknown>(path: string): Promise<T> {
        return this.request<T>(path, {method:'DELETE'});
    }
}

export const apiClient = new ApiClient();
