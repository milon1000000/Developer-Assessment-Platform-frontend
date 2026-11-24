import type { ApiResponse } from "./auth.type";

export interface IAuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
}

export interface IAuditStats {
  totalLogs: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
  entities: Array<{
    entity: string;
    count: number;
  }>;
}

export interface AuditLogQueryParams {
  searchTerm?: string;
  search?: string;
  action?: string;
  entity?: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type AuditLogListResponse = ApiResponse<IAuditLog[]>;
export type SingleAuditLogResponse = ApiResponse<IAuditLog>;
export type AuditStatsResponse = ApiResponse<IAuditStats>;
