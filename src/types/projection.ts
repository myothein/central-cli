// packages/central-cli/src/types/projection.ts

export type ProjectionStatusType = "RUNNING" | "PAUSED" | "FAILED";

export interface ProjectionInfo {
    projectionId: string;
    name: string;
    status: ProjectionStatusType;
    lastProcessedAt: string | null;
    pendingEvents: number;
}

export interface ProjectionStatus {
    projectionId: string;
    name: string;
    status: ProjectionStatusType;
    lastProcessedAt: string | null;
    pendingEvents: number;
}
