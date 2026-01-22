// packages/central-cli/src/api/client.ts
import fetch, { RequestInit } from "node-fetch";
import { loadConfig } from "../config/load-config.js";

/**
 * Central API client for central-cli
 * Uses base URL and optional API key from config
 */
class ApiClient {
    private baseUrl: string;
    private apiKey?: string;

    constructor() {
        const config = loadConfig();
        this.baseUrl = config.centralApiUrl;
        this.apiKey = config.apiKey;
    }

    private async request(
        path: string,
        options: RequestInit = {}
    ): Promise<any> {
        const url = `${this.baseUrl}${path}`;
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (this.apiKey) {
            headers["Authorization"] = `Bearer ${this.apiKey}`;
        }

        try {
            const res = await fetch(url, { ...options, headers });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(
                    `HTTP ${res.status} ${res.statusText}: ${text || ""}`
                );
            }
            // Assume JSON response
            return await res.json();
        } catch (err: any) {
            throw new Error(`API request failed: ${err.message}`);
        }
    }

    // GET request
    async get(path: string): Promise<any> {
        return this.request(path, { method: "GET" });
    }

    // POST request
    async post(path: string, body?: any): Promise<any> {
        return this.request(path, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    // PUT request
    async put(path: string, body?: any): Promise<any> {
        return this.request(path, {
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    // DELETE request
    async delete(path: string): Promise<any> {
        return this.request(path, { method: "DELETE" });
    }
}

// Export a singleton client instance
export const apiClient = new ApiClient();
