import apiClient from "@/lib/apiClient";
import type {
  AdminDashboardResponse,
  DeveloperDashboardResponse,
  RecruiterDashboardResponse,
} from "@/types/dashboard.type";

// 1. Get Admin platform overview & metrics
export function getAdminDashboard(): Promise<AdminDashboardResponse> {
  return apiClient("/dashboard/admin");
}

// 2. Get Recruiter company hiring overview & metrics
export function getRecruiterDashboard(): Promise<RecruiterDashboardResponse> {
  return apiClient("/dashboard/recruiter");
}

// 3. Get Developer personal assessment overview
export function getDeveloperDashboard(): Promise<DeveloperDashboardResponse> {
  return apiClient("/dashboard/developer");
}
