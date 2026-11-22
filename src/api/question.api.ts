import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types/auth.type";
import type {
  CreateGlobalQuestionPayload,
  IGlobalQuestion,
  QuestionListResponse,
  QuestionQueryParams,
  UpdateGlobalQuestionPayload,
} from "@/types/question.type";

// 1. Get all questions with filters & pagination
export function getGlobalQuestions(
  params?: QuestionQueryParams,
): Promise<QuestionListResponse> {
  const query = new URLSearchParams();

  if (params?.searchTerm) query.append("searchTerm", params.searchTerm);
  if (params?.search) query.append("search", params.search);
  if (params?.title) query.append("title", params.title);

  if (params?.difficulty && params.difficulty !== "ALL") {
    query.append("difficulty", params.difficulty);
  }

  if (params?.type && params.type !== "ALL") {
    query.append("type", params.type);
  }

  if (params?.isActive !== undefined && params.isActive !== "") {
    query.append("isActive", String(params.isActive));
  }

  if (params?.tags) {
    if (Array.isArray(params.tags)) {
      query.append("tags", params.tags.join(","));
    } else if (params.tags.trim()) {
      query.append("tags", params.tags);
    }
  }

  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.sortBy) query.append("sortBy", params.sortBy);
  if (params?.sortOrder) query.append("sortOrder", params.sortOrder);

  const queryString = query.toString();
  const endpoint = queryString
    ? `/global-questions?${queryString}`
    : "/global-questions";

  return apiClient(endpoint);
}

// 2. Get single question by ID or Slug
export function getGlobalQuestionById(
  id: string,
): Promise<ApiResponse<IGlobalQuestion>> {
  return apiClient(`/global-questions/${id}`);
}

// 3. Create a new global question (Admin)
export function createGlobalQuestion(
  payload: CreateGlobalQuestionPayload,
): Promise<ApiResponse<IGlobalQuestion>> {
  return apiClient("/global-questions", {
    method: "POST",
    body: payload,
  });
}

// 4. Update an existing global question (Admin)
export function updateGlobalQuestion(
  id: string,
  payload: UpdateGlobalQuestionPayload,
): Promise<ApiResponse<IGlobalQuestion>> {
  return apiClient(`/global-questions/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

// 5. Soft-delete a global question (Admin)
export function deleteGlobalQuestion(
  id: string,
): Promise<ApiResponse<IGlobalQuestion>> {
  return apiClient(`/global-questions/${id}`, {
    method: "DELETE",
  });
}
