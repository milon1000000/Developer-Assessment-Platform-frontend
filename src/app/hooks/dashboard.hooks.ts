import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboard,
  getDeveloperDashboard,
  getRecruiterDashboard,
} from "@/api/dashboard.api";

export const DASHBOARD_QUERY_KEYS = {
  all: ["dashboard"] as const,
  admin: () => [...DASHBOARD_QUERY_KEYS.all, "admin"] as const,
  recruiter: () => [...DASHBOARD_QUERY_KEYS.all, "recruiter"] as const,
  developer: () => [...DASHBOARD_QUERY_KEYS.all, "developer"] as const,
};

// Hook: Fetch Admin platform analytics
export function useAdminDashboard(enabled = true) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.admin(),
    queryFn: () => getAdminDashboard(),
    enabled,
    refetchInterval: 30000, // Background poll every 30s for live health
  });
}

// Hook: Fetch Recruiter hiring metrics
export function useRecruiterDashboard(enabled = true) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.recruiter(),
    queryFn: () => getRecruiterDashboard(),
    enabled,
  });
}

// Hook: Fetch Developer personal overview
export function useDeveloperDashboard(enabled = true) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.developer(),
    queryFn: () => getDeveloperDashboard(),
    enabled,
  });
}
