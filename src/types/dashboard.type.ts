import type { ApiResponse } from "./auth.type";

export interface IAdminDashboardCounts {
  totalUsers: number;
  totalDevelopers: number;
  totalRecruiters: number;
  totalAssessments: number;
  totalQuestions: number;
  totalInvites: number;
  totalSubmissions: number;
  completedSubmissions: number;
  passedSubmissions: number;
  disqualifiedSubmissions: number;
  overallPassRate: number;
}

export interface IAdminDashboardOverview {
  counts: IAdminDashboardCounts;
  recentActivity: {
    recentSubmissions: Array<{
      id: string;
      totalScore: number;
      percentage: number;
      isPassed: boolean;
      status: string;
      startedAt: string;
      developer?: {
        name: string;
        user?: { email: string };
      };
      assessment?: {
        title: string;
      };
    }>;
    recentAssessments: Array<{
      id: string;
      title: string;
      durationMinutes: number;
      passingScore: number;
      createdAt: string;
      _count?: {
        questions: number;
        invites: number;
      };
    }>;
    recentUsers: Array<{
      id: string;
      email: string;
      role: string;
      status: string;
      createdAt: string;
    }>;
  };
}

export interface IRecruiterDashboardCounts {
  totalAssessments: number;
  activeAssessments: number;
  totalInvites: number;
  pendingInvites: number;
  acceptedInvites: number;
  totalSubmissions: number;
  completedSubmissions: number;
  passedCandidates: number;
  failedCandidates: number;
  disqualifiedCandidates: number;
  passRate: number;
  averageScore: number;
}

export interface IRecruiterDashboardOverview {
  counts: IRecruiterDashboardCounts;
  recentSubmissions: Array<{
    id: string;
    totalScore: number;
    percentage: number;
    isPassed: boolean;
    status: string;
    startedAt: string;
    developer?: {
      name: string;
      user?: { email: string };
    };
    assessment?: {
      title: string;
    };
  }>;
  topAssessments: Array<{
    id: string;
    title: string;
    durationMinutes: number;
    passingScore: number;
    _count?: {
      invites: number;
      submissions: number;
    };
  }>;
}

export interface IDeveloperDashboardCounts {
  totalAttempted: number;
  completed: number;
  passed: number;
  failed: number;
  inProgress: number;
  passRate: number;
  averageScore: number;
}

export interface IDeveloperDashboardOverview {
  counts: IDeveloperDashboardCounts;
  recentSubmissions: Array<{
    id: string;
    totalScore: number;
    percentage: number;
    isPassed: boolean;
    status: string;
    startedAt: string;
    assessment?: {
      title: string;
      durationMinutes: number;
    };
  }>;
}

export type AdminDashboardResponse = ApiResponse<IAdminDashboardOverview>;
export type RecruiterDashboardResponse =
  ApiResponse<IRecruiterDashboardOverview>;
export type DeveloperDashboardResponse =
  ApiResponse<IDeveloperDashboardOverview>;
