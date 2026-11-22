import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGlobalQuestion,
  deleteGlobalQuestion,
  getGlobalQuestionById,
  getGlobalQuestions,
  updateGlobalQuestion,
} from "@/api/question.api";
import type {
  CreateGlobalQuestionPayload,
  QuestionQueryParams,
  UpdateGlobalQuestionPayload,
} from "@/types/question.type";

export const QUESTION_QUERY_KEYS = {
  all: ["globalQuestions"] as const,
  lists: () => [...QUESTION_QUERY_KEYS.all, "list"] as const,
  list: (params?: QuestionQueryParams) =>
    [...QUESTION_QUERY_KEYS.lists(), params] as const,
  details: () => [...QUESTION_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...QUESTION_QUERY_KEYS.details(), id] as const,
};

// Hook: Fetch questions list
export function useGlobalQuestions(params?: QuestionQueryParams) {
  return useQuery({
    queryKey: QUESTION_QUERY_KEYS.list(params),
    queryFn: () => getGlobalQuestions(params),
  });
}

// Hook: Fetch single question
export function useGlobalQuestion(id: string, enabled = true) {
  return useQuery({
    queryKey: QUESTION_QUERY_KEYS.detail(id),
    queryFn: () => getGlobalQuestionById(id),
    enabled: Boolean(id) && enabled,
  });
}

// Hook: Create question (Admin)
export function useCreateGlobalQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGlobalQuestionPayload) =>
      createGlobalQuestion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.lists(),
      });
    },
  });
}

// Hook: Update question (Admin)
export function useUpdateGlobalQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateGlobalQuestionPayload;
    }) => updateGlobalQuestion(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.detail(variables.id),
      });
    },
  });
}

// Hook: Delete question (Admin)
export function useDeleteGlobalQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGlobalQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.lists(),
      });
    },
  });
}
