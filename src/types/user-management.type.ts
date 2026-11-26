import type { ApiResponse } from "./auth.type";

export type UserRole = "ADMIN" | "RECRUITER" | "DEVELOPER";
export type UserStatus = "ACTIVE" | "PENDING" | "SUSPENDED";
export type RecruiterApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IPlatformUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified?: boolean;
  isVerified?: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  adminProfile?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
  recruiterProfile?: {
    id: string;
    name: string;
    companyName: string;
    designation: string;
    avatarUrl?: string | null;
    status: RecruiterApplicationStatus;
  } | null;
  developerProfile?: {
    id: string;
    name: string;
    experienceYears: number;
    skills: string[];
    avatarUrl?: string | null;
  } | null;
}

export interface IRecruiterApplication {
  id: string;
  userId: string;
  name: string;
  companyName: string;
  designation: string;
  status: RecruiterApplicationStatus;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    status: UserStatus;
    isVerified: boolean;
    createdAt: string;
  };
}

export interface UserQueryParams {
  searchTerm?: string;
  search?: string;
  role?: UserRole | "ALL" | "";
  status?: UserStatus | "ALL" | "";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface RecruiterApplicationQueryParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface UpdateRecruiterProfilePayload {
  name?: string;
  companyName?: string;
  designation?: string;
  bio?: string;
  websiteUrl?: string;
  avatarUrl?: string;
}

export type UserListResponse = ApiResponse<IPlatformUser[]>;
export type SingleUserResponse = ApiResponse<IPlatformUser>;
export type RecruiterApplicationsResponse = ApiResponse<
  IRecruiterApplication[]
>;
