import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  getMe,
  getNewAccessToken,
  logout,
  recruiterRegistration,
  recruiterVerification,
  updateProfile,
  userForgotPassword,
  userLogin,
  userRegistration,
  userResetPassword,
  userVerification,
} from "@/api/auth.api";

// Hook: User Login
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userLogin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

// Hook: Developer Registration & Verification
export function useRegistration() {
  return useMutation({
    mutationFn: userRegistration,
  });
}
export const useDeveloperRegistration = useRegistration;

export function useVerification() {
  return useMutation({
    mutationFn: userVerification,
  });
}
export const useVerifyEmail = useVerification;

// Hook: Recruiter Registration & Verification
export function useRecruiterRegistration() {
  return useMutation({
    mutationFn: recruiterRegistration,
  });
}

export function useRecruiterVerification() {
  return useMutation({
    mutationFn: recruiterVerification,
  });
}

// Hook: Current Authenticated User & Profile
export function useGetMe() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getMe,
    retry: false,
  });
}
export const useCurrentUser = useGetMe;

// Hook: Logout
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// Hook: Update Profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

// Hook: Forgot & Reset Password
export function useForgotPassword() {
  return useMutation({
    mutationFn: userForgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: userResetPassword,
  });
}

// Hook: Change Password
export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

// Hook: Refresh Access Token
export function useRefreshToken() {
  return useMutation({
    mutationFn: getNewAccessToken,
  });
}
