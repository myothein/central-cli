// packages/central-cli/src/types/event.ts

export type EventStatus = "PENDING" | "PROCESSED" | "FAILED";

export interface EventInfo {
    eventId: string;
    tenantId: string;
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    createdAt: string;
    status: EventStatus;
}

export interface EventProcessorStatus {
    tenantId: string;
    pending: number;
    lastProcessedAt: string | null;
    status: "RUNNING" | "PAUSED" | "FAILED";
}
