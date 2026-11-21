export type UserRole = "ADMIN" | "RECRUITER" | "DEVELOPER";

export type UserStatus = "ACTIVE" | "PENDING" | "SUSPENDED";

// 1. Login
export interface LoginPayload {
  email: string;
  password: string;
}

// 2. Developer Registration (Project standard: Developer, with ITenantRegistrationPayload alias for compatibility)
export interface DeveloperRegistrationPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
  skills?: string[];
  experienceYears?: number;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
}

export type RegisterDeveloperPayload = DeveloperRegistrationPayload;

// 3. Developer Email Verification
export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export type VerifyAccountPayload = VerifyEmailPayload;
export type VerifyDeveloperPayload = VerifyEmailPayload;

// 4. Recruiter Registration & Verification
export interface RecruiterRegistrationPayload {
  name: string;
  email: string;
  companyName: string;
  companyWebsite?: string | null;
  designation?: string | null;
  phone?: string | null;
}

export interface VerifyRecruiterEmailPayload {
  email: string;
  otp: string;
}

// 5. Password Management
export interface ForgotPassword {
  email: string;
}

export type ForgotPasswordPayload = ForgotPassword;

export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
  otp: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

// 6. Profiles & Data Models
export interface IDeveloperProfile {
  id: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  skills: string[];
  experienceYears: number;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  resumeUrl?: string | null;
}

export interface IRecruiterProfile {
  id: string;
  name: string;
  companyName: string;
  companyWebsite?: string | null;
  designation?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
}

export interface IAdminProfile {
  id: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  developerProfile?: IDeveloperProfile | null;
  recruiterProfile?: IRecruiterProfile | null;
  adminProfile?: IAdminProfile | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: IUser;
  developer?: IDeveloperProfile;
  recruiter?: IRecruiterProfile;
  admin?: IAdminProfile;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
