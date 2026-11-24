import type { ApiResponse } from "./auth.type";
import type { IAssessmentQuestion, IRecruiterSummary } from "./assessment.type";
import type { QuestionDifficulty, QuestionType } from "./question.type";

export type { IAssessmentQuestion, QuestionDifficulty, QuestionType };

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

// 1. Answer Item
export interface IAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  selectedOption?: string | null;
  code?: string | null;
  language?: string | null;
  scoreEarned: number;
  passedTestCases: number;
  totalTestCases: number;
  executionDetails?: any;
  createdAt: string;
  updatedAt: string;
  question?: IAssessmentQuestion;
}

// 2. Proctoring Log Item
export interface IProctorLog {
  id: string;
  submissionId: string;
  eventType: ProctorEventType;
  details?: string | null;
  createdAt: string;
}

// 3. Developer Summary
export interface IDeveloperSummary {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string | null;
  user?: {
    id: string;
    email: string;
  };
}

// 4. Assessment Summary attached to a submission
export interface IAssessmentSubmissionSummary {
  id: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  passingScore: number;
  maxTabSwitches: number;
  recruiter?: IRecruiterSummary;
  questions?: IAssessmentQuestion[];
}

// 5. Main Submission Model
export interface ISubmission {
  id: string;
  assessmentId: string;
  developerId: string;
  status: SubmissionStatus;
  totalScore: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  startedAt: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  timeSpentSeconds: number;
  tabSwitchCount: number;
  copyPasteCount: number;
  feedback?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  updatedAt: string;

  developer?: IDeveloperSummary;
  assessment?: IAssessmentSubmissionSummary;
  answers?: IAnswer[];
  proctorLogs?: IProctorLog[];

  _count?: {
    answers: number;
    proctorLogs: number;
  };
}

// 6. Detailed Submission with full relations
export interface ISubmissionDetail extends ISubmission {
  developer: IDeveloperSummary;
  assessment: IAssessmentSubmissionSummary;
  answers: (IAnswer & { question: IAssessmentQuestion })[];
  proctorLogs: IProctorLog[];
}

// 7. Payloads
export interface IStartAssessmentPayload {
  inviteToken?: string;
  assessmentId?: string;
}

export interface IStartAssessmentResponse {
  submission: ISubmission;
  assessment: {
    id: string;
    title: string;
    description?: string | null;
    durationMinutes: number;
    passingScore: number;
    maxTabSwitches: number;
    recruiter?: IRecruiterSummary;
    questions: IAssessmentQuestion[];
  };
}

export interface ISubmitAnswerPayload {
  questionId: string;
  selectedOption?: string;
  code?: string;
  submittedCode?: string;
  language?: string;
  passedTestCases?: number;
  totalTestCases?: number;
}

export interface IRunCodePayload {
  questionId: string;
  code: string;
  language?: string;
}

export interface ITestCaseResult {
  id: number;
  input: any;
  expectedOutput: any;
  actualOutput: any;
  passed: boolean;
  error?: string | null;
  executionTimeMs?: number;
}

export interface IRunCodeResult {
  passedTestCases: number;
  totalTestCases: number;
  allPassed: boolean;
  executionTimeMs?: number;
  memoryUsageMb?: number;
  testCaseResults: ITestCaseResult[];
  error?: string | null;
}

export interface IProctorEventPayload {
  eventType: ProctorEventType;
  details?: any;
}

export interface IProctorEventResponse {
  disqualified: boolean;
  tabSwitchCount: number;
  copyPasteCount?: number;
  maxAllowed?: number;
  message: string;
}

export interface IReviewSubmissionPayload {
  feedback?: string;
  totalScore?: number;
}

// 8. Filters and Query Parameters
export interface SubmissionQueryParams {
  status?: SubmissionStatus | "";
  isPassed?: boolean | string;
  searchTerm?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// 9. API Responses
export type SubmissionListResponse = ApiResponse<ISubmission[]>;
export type SubmissionDetailResponse = ApiResponse<ISubmissionDetail>;
export type StartAssessmentApiResponse = ApiResponse<IStartAssessmentResponse>;
export type SubmitAnswerApiResponse = ApiResponse<IAnswer>;
export type RunCodeApiResponse = ApiResponse<IRunCodeResult>;
export type ProctorEventApiResponse = ApiResponse<IProctorEventResponse>;
export type ReviewSubmissionApiResponse = ApiResponse<ISubmission>;
