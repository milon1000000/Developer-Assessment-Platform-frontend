import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addQuestionsToAssessment,
  createAssessment,
  deleteAssessment,
  deleteAssessmentInvite,
  getAssessmentById,
  getAssessmentByInviteToken,
  getAssessmentInvites,
  getAssessments,
  removeQuestionFromAssessment,
  resendAssessmentInvite,
  sendAssessmentInvites,
  updateAssessment,
} from "@/api/assessment.api";
import type {
  AssessmentInviteQueryParams,
  AssessmentQueryParams,
  IAddQuestionsToAssessmentPayload,
  ICreateAssessmentPayload,
  ISendAssessmentInvitePayload,
  IUpdateAssessmentPayload,
} from "@/types/assessment.type";

export const ASSESSMENT_QUERY_KEYS = {
  all: ["assessments"] as const,
  lists: () => [...ASSESSMENT_QUERY_KEYS.all, "list"] as const,
  list: (params?: AssessmentQueryParams) =>
    [...ASSESSMENT_QUERY_KEYS.lists(), params] as const,
  details: () => [...ASSESSMENT_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ASSESSMENT_QUERY_KEYS.details(), id] as const,
  token: (token: string) =>
    [...ASSESSMENT_QUERY_KEYS.all, "token", token] as const,
  invites: (assessmentId: string, params?: AssessmentInviteQueryParams) =>
    [...ASSESSMENT_QUERY_KEYS.all, "invites", assessmentId, params] as const,
};

// ==========================================
// 1. Assessment Queries
// ==========================================

// Hook: Fetch all assessments with filters & pagination
export function useAssessments(params?: AssessmentQueryParams) {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.list(params),
    queryFn: () => getAssessments(params),
  });
}

// Hook: Fetch single assessment details
export function useAssessment(id: string, enabled = true) {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.detail(id),
    queryFn: () => getAssessmentById(id),
    enabled: Boolean(id) && enabled,
  });
}

// Hook: Fetch assessment by public invite token
export function useAssessmentByInviteToken(token: string, enabled = true) {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.token(token),
    queryFn: () => getAssessmentByInviteToken(token),
    enabled: Boolean(token) && enabled,
  });
}

// Hook: Fetch candidate invitations for an assessment
export function useAssessmentInvites(
  assessmentId: string,
  params?: AssessmentInviteQueryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.invites(assessmentId, params),
    queryFn: () => getAssessmentInvites(assessmentId, params),
    enabled: Boolean(assessmentId) && enabled,
  });
}

// ==========================================
// 2. Assessment Mutations
// ==========================================

// Hook: Create assessment (Recruiter / Admin)
export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ICreateAssessmentPayload) =>
      createAssessment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.lists(),
      });
    },
  });
}

// Hook: Update assessment (Recruiter / Admin)
export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IUpdateAssessmentPayload;
    }) => updateAssessment(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.detail(variables.id),
      });
    },
  });
}

// Hook: Delete assessment (Soft delete)
export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.lists(),
      });
    },
  });
}

// Hook: Add questions to assessment
export function useAddQuestionsToAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: IAddQuestionsToAssessmentPayload;
    }) => addQuestionsToAssessment(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.detail(variables.id),
      });
    },
  });
}

// Hook: Remove question from assessment
export function useRemoveQuestionFromAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      questionId,
    }: {
      assessmentId: string;
      questionId: string;
    }) => removeQuestionFromAssessment(assessmentId, questionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.detail(variables.assessmentId),
      });
    },
  });
}

// ==========================================
// 3. Invitation Mutations
// ==========================================

// Hook: Send candidate invitations via email
export function useSendAssessmentInvites() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ISendAssessmentInvitePayload) =>
      sendAssessmentInvites(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...ASSESSMENT_QUERY_KEYS.all,
          "invites",
          variables.assessmentId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.detail(variables.assessmentId),
      });
    },
  });
}

// Hook: Resend invitation email
export function useResendAssessmentInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => resendAssessmentInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...ASSESSMENT_QUERY_KEYS.all, "invites"],
      });
    },
  });
}

// Hook: Delete/Cancel invitation
export function useDeleteAssessmentInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => deleteAssessmentInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...ASSESSMENT_QUERY_KEYS.all, "invites"],
      });
    },
  });
}
