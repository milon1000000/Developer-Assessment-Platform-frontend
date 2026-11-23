import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types/auth.type";
import type {
  AssessmentDetailResponse,
  AssessmentInviteQueryParams,
  AssessmentInvitesResponse,
  AssessmentListResponse,
  AssessmentQueryParams,
  IAddQuestionsToAssessmentPayload,
  IAssessment,
  IAssessmentInvite,
  IAssessmentQuestion,
  ICreateAssessmentPayload,
  ISendAssessmentInvitePayload,
  IUpdateAssessmentPayload,
  SendInvitesResultResponse,
} from "@/types/assessment.type";

// ==========================================
// 1. Assessment CRUD & Query APIs
// ==========================================

// Get all assessments with filters & pagination
export function getAssessments(
  params?: AssessmentQueryParams,
): Promise<AssessmentListResponse> {
  const query = new URLSearchParams();

  if (params?.searchTerm) query.append("searchTerm", params.searchTerm);
  if (params?.search) query.append("search", params.search);
  if (params?.title) query.append("title", params.title);

  if (params?.isActive !== undefined && params.isActive !== "") {
    query.append("isActive", String(params.isActive));
  }

  if (params?.recruiterId) {
    query.append("recruiterId", params.recruiterId);
  }

  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

  const queryString = query.toString();
  const endpoint = queryString ? `/assessments?${queryString}` : "/assessments";

  return apiClient(endpoint);
}

// Get single assessment details by ID
export function getAssessmentById(
  id: string,
): Promise<AssessmentDetailResponse> {
  return apiClient(`/assessments/${id}`);
}

// Candidate public preview / access assessment by token
export function getAssessmentByInviteToken(
  token: string,
): Promise<AssessmentDetailResponse> {
  return apiClient(`/assessments/token/${token}`);
}

// Create a new assessment (Recruiter / Admin)
export function createAssessment(
  payload: ICreateAssessmentPayload,
): Promise<ApiResponse<IAssessment>> {
  return apiClient("/assessments", {
    method: "POST",
    body: payload,
  });
}

// Update assessment metadata (Recruiter / Admin)
export function updateAssessment(
  id: string,
  payload: IUpdateAssessmentPayload,
): Promise<ApiResponse<IAssessment>> {
  return apiClient(`/assessments/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

// Delete assessment (Soft delete)
export function deleteAssessment(
  id: string,
): Promise<ApiResponse<IAssessment>> {
  return apiClient(`/assessments/${id}`, {
    method: "DELETE",
  });
}

// Add questions to an existing assessment
export function addQuestionsToAssessment(
  id: string,
  payload: IAddQuestionsToAssessmentPayload,
): Promise<ApiResponse<IAssessmentQuestion[]>> {
  return apiClient(`/assessments/${id}/questions`, {
    method: "POST",
    body: payload,
  });
}

// Remove a question from an assessment
export function removeQuestionFromAssessment(
  assessmentId: string,
  questionId: string,
): Promise<ApiResponse<{ message: string }>> {
  return apiClient(`/assessments/${assessmentId}/questions/${questionId}`, {
    method: "DELETE",
  });
}

// ==========================================
// 2. Candidate Invitation APIs
// ==========================================

// Send candidate assessment invitations via email
export function sendAssessmentInvites(
  payload: ISendAssessmentInvitePayload,
): Promise<SendInvitesResultResponse> {
  return apiClient("/assessment-invites", {
    method: "POST",
    body: payload,
  });
}

// Get all candidate invitations across all assessments (Recruiter / Admin)
export function getAllAssessmentInvites(
  params?: AssessmentInviteQueryParams & { assessmentId?: string },
): Promise<AssessmentInvitesResponse> {
  const query = new URLSearchParams();

  if (params?.searchTerm) query.append("searchTerm", params.searchTerm);
  if (params?.search) query.append("search", params.search);
  if (params?.assessmentId) query.append("assessmentId", params.assessmentId);
  if (params?.status) query.append("status", params.status);
  if (params?.email) query.append("email", params.email);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

  const queryString = query.toString();
  const endpoint = queryString
    ? `/assessment-invites?${queryString}`
    : "/assessment-invites";

  return apiClient(endpoint);
}

// Get all candidate invitations for a specific assessment
export function getAssessmentInvites(
  assessmentId: string,
  params?: AssessmentInviteQueryParams,
): Promise<AssessmentInvitesResponse> {
  const query = new URLSearchParams();

  if (params?.searchTerm) query.append("searchTerm", params.searchTerm);
  if (params?.search) query.append("search", params.search);
  if (params?.status) query.append("status", params.status);
  if (params?.email) query.append("email", params.email);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

  const queryString = query.toString();
  const endpoint = queryString
    ? `/assessment-invites/assessment/${assessmentId}?${queryString}`
    : `/assessment-invites/assessment/${assessmentId}`;

  return apiClient(endpoint);
}

// Verify candidate invitation link by token (Public / Candidate)
export function verifyAssessmentInviteToken(
  token: string,
): Promise<ApiResponse<IAssessmentInvite>> {
  return apiClient(`/assessment-invites/verify/${token}`);
}

// Resend invitation email
export function resendAssessmentInvite(
  inviteId: string,
): Promise<ApiResponse<IAssessmentInvite>> {
  return apiClient(`/assessment-invites/${inviteId}/resend`, {
    method: "POST",
  });
}

// Cancel or delete invitation
export function deleteAssessmentInvite(
  inviteId: string,
): Promise<ApiResponse<{ message: string }>> {
  return apiClient(`/assessment-invites/${inviteId}`, {
    method: "DELETE",
  });
}
