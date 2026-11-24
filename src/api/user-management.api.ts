import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types/auth.type";
import type {
  RecruiterApplicationQueryParams,
  RecruiterApplicationsResponse,
  SingleUserResponse,
  UpdateRecruiterProfilePayload,
  UserListResponse,
  UserQueryParams,
  UserStatus,
} from "@/types/user-management.type";

// 1. Get all platform users (Admin)
export function getAllUsers(
  params?: UserQueryParams,
): Promise<UserListResponse> {
  const query = new URLSearchParams();
  if (params?.searchTerm) query.append("searchTerm", params.searchTerm);
  if (params?.search) query.append("search", params.search);
  if (params?.role && params.role !== "ALL") query.append("role", params.role);
  if (params?.status && params.status !== "ALL")
    query.append("status", params.status);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

  const qs = query.toString();
  return apiClient(qs ? `/user/all-users?${qs}` : "/user/all-users");
}

// 2. Get user by ID (Admin)
export function getUserById(id: string): Promise<SingleUserResponse> {
  return apiClient(`/user/${id}`);
}

// 3. Change user status (Admin: ACTIVE / BLOCKED / SUSPENDED)
export function changeUserStatus(
  id: string,
  status: UserStatus,
): Promise<SingleUserResponse> {
  return apiClient(`/user/status/${id}`, {
    method: "PATCH",
    body: { status },
  });
}

// 4. Delete user (Admin)
export function deleteUser(id: string): Promise<ApiResponse<null>> {
  return apiClient(`/user/${id}`, {
    method: "DELETE",
  });
}

// 5. Get pending recruiter applications (Admin)
export function getPendingRecruiterApplications(
  params?: RecruiterApplicationQueryParams,
): Promise<RecruiterApplicationsResponse> {
  const query = new URLSearchParams();
  if (params?.searchTerm) query.append("searchTerm", params.searchTerm);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));

  const qs = query.toString();
  return apiClient(
    qs ? `/user/recruiter-applications?${qs}` : "/user/recruiter-applications",
  );
}

// 6. Approve recruiter application (Admin)
export function approveRecruiterApplication(
  id: string,
): Promise<ApiResponse<null>> {
  return apiClient(`/user/recruiter-application/${id}/approve`, {
    method: "PATCH",
  });
}

// 7. Reject recruiter application (Admin)
export function rejectRecruiterApplication(
  id: string,
  reason?: string,
): Promise<ApiResponse<null>> {
  return apiClient(`/user/recruiter-application/${id}/reject`, {
    method: "PATCH",
    body: { reason },
  });
}

// 8. Get Recruiter profile
export function getRecruiterProfile(): Promise<ApiResponse<any>> {
  return apiClient("/user/recruiter/profile");
}

// 9. Update Recruiter profile (JSON or FormData)
export function updateRecruiterProfile(
  payload: UpdateRecruiterProfilePayload | FormData,
): Promise<ApiResponse<any>> {
  return apiClient("/user/recruiter/profile", {
    method: "PATCH",
    body: payload,
  });
}

// 10. Get Admin profile
export function getAdminProfile(): Promise<ApiResponse<any>> {
  return apiClient("/user/admin/profile");
}

// 11. Update Admin profile
export function updateAdminProfile(
  payload: { name?: string; phone?: string; avatarUrl?: string } | FormData,
): Promise<ApiResponse<any>> {
  return apiClient("/user/admin/profile", {
    method: "PATCH",
    body: payload,
  });
}
