// packages/central-cli/src/api/client.ts
import fetch from "node-fetch";
import { loadConfig } from "../config/load-config.js";
/**
 * Central API client for central-cli
 * Uses base URL and optional API key from config
 */
class ApiClient {
    baseUrl;
    apiKey;
    constructor() {
        const config = loadConfig();
        this.baseUrl = config.centralApiUrl;
        this.apiKey = config.apiKey;
    }
    async request(path, options = {}) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
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
                throw new Error(`HTTP ${res.status} ${res.statusText}: ${text || ""}`);
            }
            // Assume JSON response
            return await res.json();
        }
        catch (err) {
            throw new Error(`API request failed: ${err.message}`);
        }
    }
    // GET request
    async get(path) {
        return this.request(path, { method: "GET" });
    }
    // POST request
    async post(path, body) {
        return this.request(path, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        });
    }
    // PUT request
    async put(path, body) {
        return this.request(path, {
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        });
    }
    // DELETE request
    async delete(path) {
        return this.request(path, { method: "DELETE" });
    }
}
// Export a singleton client instance
export const apiClient = new ApiClient();
