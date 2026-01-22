// packages/central-cli/src/types/tenant.ts

export type TenantStatusType = "ACTIVE" | "SUSPENDED" | "DOWN" | "UNKNOWN" | "DEGRADED";

export interface TenantInfo {
    tenantId: string;
    name: string;
    status: TenantStatusType;
    createdAt: string;
}

export interface TenantStatus {
    tenantId: string;
    status: TenantStatusType;
    online: boolean | null;
    lastHeartbeat: string | null;
}
