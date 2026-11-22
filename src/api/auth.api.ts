import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  AuthResponse,
  ChangePasswordPayload,
  DeveloperRegistrationPayload,
  ForgotPassword,
  IUser,
  LoginPayload,
  RecruiterRegistrationPayload,
  ResetPasswordPayload,
  VerifyAccountPayload,
  VerifyRecruiterEmailPayload,
} from "@/types/auth.type";

// 1. User Login (for Developer, Recruiter, Admin)
export function userLogin(
  payload: LoginPayload,
): Promise<ApiResponse<AuthResponse>> {
  return apiClient("/auth/login", { method: "POST", body: payload });
}

// 2. Developer Registration
export function userRegistration(
  payload: DeveloperRegistrationPayload,
): Promise<ApiResponse<null>> {
  return apiClient("/auth/register", { method: "POST", body: payload });
}

// 3. Developer Email Verification
export function userVerification(
  payload: VerifyAccountPayload,
): Promise<ApiResponse<AuthResponse>> {
  return apiClient("/auth/verify-email", { method: "POST", body: payload });
}

// 4. Current User Profile
export function getMe(): Promise<ApiResponse<IUser>> {
  return apiClient("/user/me");
}

// 5. Logout
export function logout(): Promise<ApiResponse<null>> {
  return apiClient("/auth/logout", { method: "POST" });
}

// 6. Refresh Token
export function getNewAccessToken(): Promise<
  ApiResponse<{ accessToken: string; refreshToken?: string }>
> {
  return apiClient("/auth/refresh-token", {
    method: "POST",
  });
}

// 7. Update Profile
export function updateProfile(payload: FormData): Promise<ApiResponse<IUser>> {
  return apiClient("/user/update-profile", {
    method: "PATCH",
    body: payload,
  });
}

// 8. Forgot Password
export function userForgotPassword(
  payload: ForgotPassword,
): Promise<ApiResponse<null>> {
  return apiClient("/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

// 9. Reset Password
export function userResetPassword(
  payload: ResetPasswordPayload,
): Promise<ApiResponse<null>> {
  return apiClient("/auth/reset-password", {
    method: "POST",
    body: payload,
  });
}

// Recruiter Registration & Verification
export function recruiterRegistration(
  payload: RecruiterRegistrationPayload,
): Promise<ApiResponse<null>> {
  return apiClient("/auth/register-recruiter", {
    method: "POST",
    body: payload,
  });
}

export function recruiterVerification(
  payload: VerifyRecruiterEmailPayload,
): Promise<ApiResponse<AuthResponse>> {
  return apiClient("/auth/verify-recruiter-email", {
    method: "POST",
    body: payload,
  });
}

// Change Password
export function changePassword(
  payload: ChangePasswordPayload,
): Promise<ApiResponse<null>> {
  return apiClient("/auth/change-password", { method: "POST", body: payload });
}
