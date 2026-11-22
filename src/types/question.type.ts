export type QuestionType = "CODING" | "MCQ";
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface TestCase {
  id?: string;
  input: string;
  output: string;
  isHidden?: boolean;
  explanation?: string;
}

export interface McqOption {
  id: string;
  text: string;
}

export interface StarterCode {
  javascript?: string;
  python?: string;
  cpp?: string;
  java?: string;
  typescript?: string;
  [language: string]: string | undefined;
}

export interface IGlobalQuestion {
  id: string;
  title: string;
  slug: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  tags: string[];
  problemStatement: string;
  constraints?: string | null;
  starterCode?: StarterCode | null;
  testCases?: TestCase[] | null;
  mcqOptions?: McqOption[] | null;
  correctOption?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    user?: {
      id: string;
      email: string;
      role: string;
      status: string;
    };
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGlobalQuestionPayload {
  title: string;
  type?: QuestionType;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  problemStatement: string;
  constraints?: string;
  starterCode?: StarterCode;
  testCases?: TestCase[];
  mcqOptions?: McqOption[];
  correctOption?: string;
}

export interface UpdateGlobalQuestionPayload {
  title?: string;
  type?: QuestionType;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  problemStatement?: string;
  constraints?: string;
  starterCode?: StarterCode;
  testCases?: TestCase[];
  mcqOptions?: McqOption[];
  correctOption?: string;
  isActive?: boolean;
}

export interface QuestionQueryParams {
  searchTerm?: string;
  search?: string;
  title?: string;
  difficulty?: QuestionDifficulty | "ALL";
  type?: QuestionType | "ALL";
  tags?: string | string[];
  isActive?: boolean | string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface QuestionPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QuestionListResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data: IGlobalQuestion[];
  meta: QuestionPaginationMeta;
}
