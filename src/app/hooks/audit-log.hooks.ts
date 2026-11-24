import { useQuery } from "@tanstack/react-query";
import {
  getAllAuditLogs,
  getAuditLogById,
  getAuditStats,
} from "@/api/audit-log.api";
import type { AuditLogQueryParams } from "@/types/audit-log.type";

export const AUDIT_LOG_QUERY_KEYS = {
  all: ["audit-log"] as const,
  list: (params?: AuditLogQueryParams) =>
    [...AUDIT_LOG_QUERY_KEYS.all, "list", params] as const,
  stats: () => [...AUDIT_LOG_QUERY_KEYS.all, "stats"] as const,
  detail: (id: string) => [...AUDIT_LOG_QUERY_KEYS.all, "detail", id] as const,
};

// Hook: Fetch all audit logs with filters & pagination
export function useAuditLogs(params?: AuditLogQueryParams) {
  return useQuery({
    queryKey: AUDIT_LOG_QUERY_KEYS.list(params),
    queryFn: () => getAllAuditLogs(params),
  });
}

// Hook: Fetch audit statistics
export function useAuditStats() {
  return useQuery({
    queryKey: AUDIT_LOG_QUERY_KEYS.stats(),
    queryFn: () => getAuditStats(),
  });
}

// Hook: Fetch single audit log
export function useAuditLog(id: string, enabled = true) {
  return useQuery({
    queryKey: AUDIT_LOG_QUERY_KEYS.detail(id),
    queryFn: () => getAuditLogById(id),
    enabled: Boolean(id) && enabled,
  });
}
