import apiClient from "@/lib/apiClient";
import type {
  IProctorEventPayload,
  IReviewSubmissionPayload,
  IRunCodePayload,
  IStartAssessmentPayload,
  ISubmitAnswerPayload,
  ProctorEventApiResponse,
  ReviewSubmissionApiResponse,
  RunCodeApiResponse,
  StartAssessmentApiResponse,
  SubmissionDetailResponse,
  SubmissionListResponse,
  SubmissionQueryParams,
  SubmitAnswerApiResponse,
} from "@/types/submission.type";

// ==========================================
// 1. Candidate Live Assessment Flow APIs
// ==========================================

// Developer starts or resumes an assessment session
export function startAssessment(
  payload: IStartAssessmentPayload,
): Promise<StartAssessmentApiResponse> {
  return apiClient("/submissions/start", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Developer saves or updates an answer (intermediate draft or choice)
export function saveAnswer(
  submissionId: string,
  payload: ISubmitAnswerPayload,
): Promise<SubmitAnswerApiResponse> {
  return apiClient(`/submissions/${submissionId}/answer`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Developer executes code against sample test cases in cloud sandbox
export function runCode(
  submissionId: string,
  payload: IRunCodePayload,
): Promise<RunCodeApiResponse> {
  return apiClient(`/submissions/${submissionId}/run-code`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Developer records a proctoring event (e.g. TAB_SWITCH, COPY_PASTE, WINDOW_BLUR)
export function recordProctorEvent(
  submissionId: string,
  payload: IProctorEventPayload,
): Promise<ProctorEventApiResponse> {
  return apiClient(`/submissions/${submissionId}/proctor-event`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Developer finalizes and submits exam (triggers automated grading suite)
export function submitExam(
  submissionId: string,
): Promise<SubmissionDetailResponse> {
  return apiClient(`/submissions/${submissionId}/submit`, {
    method: "POST",
  });
}

// ==========================================
// 2. Query & Listing APIs
// ==========================================

// Developer views all their past and ongoing submissions
export function getMySubmissions(
  params?: SubmissionQueryParams,
): Promise<SubmissionListResponse> {
  const query = new URLSearchParams();

  if (params?.status) query.append("status", params.status);
  if (params?.isPassed !== undefined && params.isPassed !== "") {
    query.append("isPassed", String(params.isPassed));
  }
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

  const queryString = query.toString();
  const endpoint = queryString
    ? `/submissions/my-submissions?${queryString}`
    : "/submissions/my-submissions";

  return apiClient(endpoint);
}

// Recruiter / Admin views all candidate submissions for a specific assessment
export function getSubmissionsByAssessment(
  assessmentId: string,
  params?: SubmissionQueryParams,
): Promise<SubmissionListResponse> {
  const query = new URLSearchParams();

  if (params?.status) query.append("status", params.status);
  if (params?.isPassed !== undefined && params.isPassed !== "") {
    query.append("isPassed", String(params.isPassed));
  }
  if (params?.searchTerm) query.append("searchTerm", params.searchTerm);
  if (params?.search) query.append("searchTerm", params.search);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

  const queryString = query.toString();
  const endpoint = queryString
    ? `/submissions/assessment/${assessmentId}?${queryString}`
    : `/submissions/assessment/${assessmentId}`;

  return apiClient(endpoint);
}

// View single submission scorecard, answers, code diffs and proctor logs
export function getSubmissionById(
  submissionId: string,
): Promise<SubmissionDetailResponse> {
  return apiClient(`/submissions/${submissionId}`);
}

// ==========================================
// 3. Recruiter Grading & Review APIs
// ==========================================

// Recruiter / Admin reviews and adds feedback/score adjustments to a submission
export function reviewSubmission(
  submissionId: string,
  payload: IReviewSubmissionPayload,
): Promise<ReviewSubmissionApiResponse> {
  return apiClient(`/submissions/${submissionId}/review`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
