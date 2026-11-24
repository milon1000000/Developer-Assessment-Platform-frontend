import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveRecruiterApplication,
  changeUserStatus,
  deleteUser,
  getAdminProfile,
  getAllUsers,
  getPendingRecruiterApplications,
  getRecruiterProfile,
  getUserById,
  rejectRecruiterApplication,
  updateAdminProfile,
  updateRecruiterProfile,
} from "@/api/user-management.api";
import type {
  RecruiterApplicationQueryParams,
  UpdateRecruiterProfilePayload,
  UserQueryParams,
  UserStatus,
} from "@/types/user-management.type";

export const USER_MANAGEMENT_QUERY_KEYS = {
  all: ["user-management"] as const,
  users: (params?: UserQueryParams) =>
    [...USER_MANAGEMENT_QUERY_KEYS.all, "users", params] as const,
  user: (id: string) =>
    [...USER_MANAGEMENT_QUERY_KEYS.all, "user", id] as const,
  recruiterApplications: (params?: RecruiterApplicationQueryParams) =>
    [
      ...USER_MANAGEMENT_QUERY_KEYS.all,
      "recruiter-applications",
      params,
    ] as const,
  recruiterProfile: () =>
    [...USER_MANAGEMENT_QUERY_KEYS.all, "recruiter-profile"] as const,
};

// Hook: Fetch all platform users
export function useAllUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: USER_MANAGEMENT_QUERY_KEYS.users(params),
    queryFn: () => getAllUsers(params),
  });
}

// Hook: Fetch single user by ID
export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: USER_MANAGEMENT_QUERY_KEYS.user(id),
    queryFn: () => getUserById(id),
    enabled: Boolean(id) && enabled,
  });
}

// Hook: Change user status (ACTIVE / BLOCKED)
export function useChangeUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      changeUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...USER_MANAGEMENT_QUERY_KEYS.all, "users"],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
    },
  });
}

// Hook: Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...USER_MANAGEMENT_QUERY_KEYS.all, "users"],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
    },
  });
}

// Hook: Fetch pending recruiter applications
export function usePendingRecruiterApplications(
  params?: RecruiterApplicationQueryParams,
) {
  return useQuery({
    queryKey: USER_MANAGEMENT_QUERY_KEYS.recruiterApplications(params),
    queryFn: () => getPendingRecruiterApplications(params),
  });
}

// Hook: Approve recruiter application
export function useApproveRecruiterApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveRecruiterApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...USER_MANAGEMENT_QUERY_KEYS.all, "recruiter-applications"],
      });
      queryClient.invalidateQueries({
        queryKey: [...USER_MANAGEMENT_QUERY_KEYS.all, "users"],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
    },
  });
}

// Hook: Reject recruiter application
export function useRejectRecruiterApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      rejectRecruiterApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...USER_MANAGEMENT_QUERY_KEYS.all, "recruiter-applications"],
      });
      queryClient.invalidateQueries({
        queryKey: [...USER_MANAGEMENT_QUERY_KEYS.all, "users"],
      });
    },
  });
}

// Hook: Fetch recruiter profile
export function useRecruiterProfile() {
  return useQuery({
    queryKey: USER_MANAGEMENT_QUERY_KEYS.recruiterProfile(),
    queryFn: () => getRecruiterProfile(),
  });
}

// Hook: Update recruiter profile
export function useUpdateRecruiterProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRecruiterProfilePayload | FormData) =>
      updateRecruiterProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_MANAGEMENT_QUERY_KEYS.recruiterProfile(),
      });
      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });
    },
  });
}

// Hook: Fetch admin profile
export function useAdminProfile() {
  return useQuery({
    queryKey: [...USER_MANAGEMENT_QUERY_KEYS.all, "admin-profile"],
    queryFn: () => getAdminProfile(),
  });
}

// Hook: Update admin profile
export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      payload: { name?: string; phone?: string; avatarUrl?: string } | FormData,
    ) => updateAdminProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...USER_MANAGEMENT_QUERY_KEYS.all, "admin-profile"],
      });
      queryClient.invalidateQueries({ queryKey: ["auth", "currentUser"] });
    },
  });
}
