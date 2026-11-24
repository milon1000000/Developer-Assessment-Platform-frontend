import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMySubmissions,
  getSubmissionById,
  getSubmissionsByAssessment,
  recordProctorEvent,
  reviewSubmission,
  runCode,
  saveAnswer,
  startAssessment,
  submitExam,
} from "@/api/submission.api";
import type {
  IProctorEventPayload,
  IReviewSubmissionPayload,
  IRunCodePayload,
  IStartAssessmentPayload,
  ISubmitAnswerPayload,
  SubmissionQueryParams,
} from "@/types/submission.type";

export const SUBMISSION_QUERY_KEYS = {
  all: ["submissions"] as const,
  my: (params?: SubmissionQueryParams) =>
    [...SUBMISSION_QUERY_KEYS.all, "my", params] as const,
  byAssessment: (assessmentId: string, params?: SubmissionQueryParams) =>
    [
      ...SUBMISSION_QUERY_KEYS.all,
      "byAssessment",
      assessmentId,
      params,
    ] as const,
  detail: (id: string) => [...SUBMISSION_QUERY_KEYS.all, "detail", id] as const,
};

// ==========================================
// 1. Candidate Exam Flow Hooks
// ==========================================

// Hook: Start or resume assessment session
export function useStartAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IStartAssessmentPayload) => startAssessment(payload),
    onSuccess: (res) => {
      if (res?.data?.submission?.id) {
        queryClient.invalidateQueries({
          queryKey: SUBMISSION_QUERY_KEYS.detail(res.data.submission.id),
        });
      }
    },
  });
}

// Hook: Auto-save / draft answer
export function useSaveAnswer() {
  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: ISubmitAnswerPayload;
    }) => saveAnswer(submissionId, payload),
  });
}

// Hook: Sandbox live code execution against sample test cases
export function useRunCode() {
  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: IRunCodePayload;
    }) => runCode(submissionId, payload),
  });
}

// Hook: Anti-cheat proctoring event logger
export function useRecordProctorEvent() {
  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: IProctorEventPayload;
    }) => recordProctorEvent(submissionId, payload),
  });
}

// Hook: Final submit exam (triggers automated grading)
export function useSubmitExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submissionId: string) => submitExam(submissionId),
    onSuccess: (_, submissionId) => {
      queryClient.invalidateQueries({
        queryKey: SUBMISSION_QUERY_KEYS.detail(submissionId),
      });
      queryClient.invalidateQueries({
        queryKey: [...SUBMISSION_QUERY_KEYS.all, "my"],
      });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

// ==========================================
// 2. Query Hooks
// ==========================================

// Hook: Get developer's own submissions
export function useMySubmissions(params?: SubmissionQueryParams) {
  return useQuery({
    queryKey: SUBMISSION_QUERY_KEYS.my(params),
    queryFn: () => getMySubmissions(params),
  });
}

// Hook: Get all submissions for an assessment (Recruiter / Admin)
export function useSubmissionsByAssessment(
  assessmentId: string,
  params?: SubmissionQueryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: SUBMISSION_QUERY_KEYS.byAssessment(assessmentId, params),
    queryFn: () => getSubmissionsByAssessment(assessmentId, params),
    enabled: Boolean(assessmentId) && enabled,
  });
}

// Hook: Get single submission details (scorecard, answers, proctor logs)
export function useSubmission(submissionId: string, enabled = true) {
  return useQuery({
    queryKey: SUBMISSION_QUERY_KEYS.detail(submissionId),
    queryFn: () => getSubmissionById(submissionId),
    enabled: Boolean(submissionId) && enabled,
  });
}

// ==========================================
// 3. Recruiter Review & Grading Hook
// ==========================================

// Hook: Review and score adjustment
export function useReviewSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: string;
      payload: IReviewSubmissionPayload;
    }) => reviewSubmission(submissionId, payload),
    onSuccess: (_, { submissionId }) => {
      queryClient.invalidateQueries({
        queryKey: SUBMISSION_QUERY_KEYS.detail(submissionId),
      });
      queryClient.invalidateQueries({
        queryKey: [...SUBMISSION_QUERY_KEYS.all, "byAssessment"],
      });
    },
  });
}
