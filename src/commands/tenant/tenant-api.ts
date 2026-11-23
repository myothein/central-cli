import { apiClient, ApiClient } from '../../api/client.js';

export interface TenantInfo {
    id: string;
    name: string;
    status: string;
    lastHeartbeat: string | null;
    online?: boolean;
}
const idPattern = /^[A-Za-z0-9_-]{1,64}$/;
export function assertTenantId(value: string): string {
    if (!idPattern.test(value)) throw new Error('Invalid tenant ID');
    return value;
}
function requireTenant(value: unknown): TenantInfo {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Invalid tenant API data');
    }
    const item = value as Record<string, unknown>;
    if (typeof item.id !== 'string' || !idPattern.test(item.id) ||
        typeof item.name !== 'string' || typeof item.status !== 'string' ||
        !(item.lastHeartbeat === null || typeof item.lastHeartbeat === 'string')) {
        throw new Error('Invalid tenant API data');
    }
    return {
        id:item.id, name:item.name, status:item.status,
        lastHeartbeat:item.lastHeartbeat as string | null,
        ...(typeof item.online === 'boolean' ? {online:item.online} : {})
    };
}
export async function listTenants(client: ApiClient = apiClient): Promise<TenantInfo[]> {
    const data = await client.get<unknown>('/tenants');
    if (!Array.isArray(data)) throw new Error('Invalid tenant list');
    return data.map(requireTenant);
}
export async function getTenantStatus(id: string, client: ApiClient = apiClient): Promise<TenantInfo> {
    const data = await client.get<unknown>('/tenants/'+assertTenantId(id)+'/status');
    return requireTenant(data);
}
export async function setTenantPaused(id: string, paused: boolean, client: ApiClient = apiClient): Promise<TenantInfo> {
    const data = await client.post<unknown>(
        '/tenants/'+assertTenantId(id)+(paused?'/pause':'/resume')
    );
    return requireTenant(data);
}
/** Central supports per-tenant status, not a bulk /tenants/status endpoint. */
export async function listTenantStatuses(client: ApiClient = apiClient): Promise<TenantInfo[]> {
    const all = await listTenants(client);
    const results: TenantInfo[] = [];
    // Sequential requests avoid request storms against larger university registries.
    for (const tenant of all) {
        results.push(await getTenantStatus(tenant.id,client));
    }
    return results;
}
