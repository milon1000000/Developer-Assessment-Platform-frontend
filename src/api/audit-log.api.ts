import apiClient from "@/lib/apiClient";
import type {
  AuditLogListResponse,
  AuditLogQueryParams,
  AuditStatsResponse,
  SingleAuditLogResponse,
} from "@/types/audit-log.type";

// 1. Get all audit logs with filters & pagination
export function getAllAuditLogs(
  params?: AuditLogQueryParams,
): Promise<AuditLogListResponse> {
  const query = new URLSearchParams();
  const searchVal = params?.searchTerm || params?.search;
  if (searchVal) query.append("searchTerm", searchVal);
  if (params?.action && params.action !== "ALL")
    query.append("action", params.action);
  if (params?.entity && params.entity !== "ALL")
    query.append("entity", params.entity);
  if (params?.userId) query.append("userId", params.userId);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

  const qs = query.toString();
  return apiClient(qs ? `/audit-logs?${qs}` : "/audit-logs");
}

// 2. Get audit statistics
export function getAuditStats(): Promise<AuditStatsResponse> {
  return apiClient("/audit-logs/stats");
}

// 3. Get single audit log details by ID
export function getAuditLogById(id: string): Promise<SingleAuditLogResponse> {
  return apiClient(`/audit-logs/${id}`);
}
