// packages/central-cli/src/types/agent.ts

export type AgentStatusType = "ACTIVE" | "SUSPENDED" | "DOWN" | "UNKNOWN" | "DEGRADED";

export interface AgentInfo {
    agentId: string;
    name: string;
    status: AgentStatusType;
    lastHeartbeat: string | null;
}

export interface AgentStatus {
    agentId: string;
    status: AgentStatusType;
    online: boolean | null;
    lastHeartbeat: string | null;
}

export interface AgentLockInfo {
    locked: boolean;
    owner?: string;
    acquiredAt?: string;
}
