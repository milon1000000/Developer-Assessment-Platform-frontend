import type { ApiResponse } from "./auth.type";
import type {
  McqOption,
  QuestionDifficulty,
  QuestionType,
  StarterCode,
  TestCase,
} from "./question.type";

export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED";

export type SubmissionStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "EXPIRED"
  | "DISQUALIFIED";

export type ProctorEventType =
  | "TAB_SWITCH"
  | "COPY_PASTE"
  | "WINDOW_BLUR"
  | "FULLSCREEN_EXIT";

// 1. Recruiter summary attached to assessment
export interface IRecruiterSummary {
  id: string;
  userId?: string;
  name: string;
  companyName: string;
  companyWebsite?: string | null;
  avatarUrl?: string | null;
}

// 2. Question item attached to an assessment
export interface IAssessmentQuestion {
  id: string;
  assessmentId: string;
  globalQuestionId?: string | null;
  title: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  problemStatement: string;
  constraints?: string | null;
  starterCode?: StarterCode | null;
  testCases?: TestCase[] | null;
  mcqOptions?: McqOption[] | null;
  correctOption?: string | null;
  points: number;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

// 3. Question input item when creating or adding to an assessment
export interface IAssessmentQuestionInput {
  globalQuestionId?: string;
  title?: string;
  type?: QuestionType;
  difficulty?: QuestionDifficulty;
  problemStatement?: string;
  constraints?: string;
  starterCode?: StarterCode;
  testCases?: TestCase[];
  mcqOptions?: McqOption[];
  correctOption?: string;
  points?: number;
  orderIndex?: number;
}

// 4. Assessment Invitation
export interface IAssessmentInvite {
  id: string;
  assessmentId: string;
  email: string;
  token: string;
  status: InviteStatus;
  sentAt: string;
  expiresAt?: string | null;
  acceptedAt?: string | null;
  assessment?: {
    id: string;
    title: string;
    durationMinutes: number;
    passingScore: number;
  };
}

// 5. Main Assessment Model
export interface IAssessment {
  id: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  passingScore: number;
  maxTabSwitches: number;
  inviteToken: string;
  expiresAt?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  recruiterId: string;
  recruiter?: IRecruiterSummary;
  questions?: IAssessmentQuestion[];
  invites?: IAssessmentInvite[];
  _count?: {
    questions: number;
    invites: number;
    submissions: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 6. Payloads
export interface ICreateAssessmentPayload {
  title: string;
  description?: string;
  durationMinutes?: number;
  passingScore?: number;
  maxTabSwitches?: number;
  expiresAt?: string | Date;
  questions?: IAssessmentQuestionInput[];
}

export interface IUpdateAssessmentPayload {
  title?: string;
  description?: string;
  durationMinutes?: number;
  passingScore?: number;
  maxTabSwitches?: number;
  expiresAt?: string | Date;
  isActive?: boolean;
}

export interface IAddQuestionsToAssessmentPayload {
  questions: IAssessmentQuestionInput[];
}

export interface ISendAssessmentInvitePayload {
  assessmentId: string;
  emails: string[];
  expiresAt?: string | Date;
}

// 7. Query Filter Parameters
export interface AssessmentQueryParams {
  searchTerm?: string;
  search?: string;
  title?: string;
  isActive?: boolean | string;
  recruiterId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AssessmentInviteQueryParams {
  searchTerm?: string;
  search?: string;
  status?: InviteStatus;
  email?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// 8. API Responses
export type AssessmentListResponse = ApiResponse<IAssessment[]>;
export type AssessmentDetailResponse = ApiResponse<IAssessment>;
export type AssessmentInvitesResponse = ApiResponse<IAssessmentInvite[]>;
export type SendInvitesResultResponse = ApiResponse<{
  assessmentId: string;
  totalProcessed: number;
  details: Array<{
    email: string;
    status: "SENT" | "SKIPPED" | "EMAIL_FAILED";
    inviteId?: string;
    reason?: string;
  }>;
}>;
