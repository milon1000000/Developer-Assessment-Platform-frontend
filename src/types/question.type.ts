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

export interface LanguageInfo {
  label: string;
  runtime: string;
  template: string;
}

export const KNOWN_LANGUAGE_TEMPLATES: Record<string, LanguageInfo> = {
  javascript: {
    label: "JavaScript",
    runtime: "Node.js 20",
    template: `function solution(args) {\n  // Write your code here\n  return null;\n}`,
  },
  typescript: {
    label: "TypeScript",
    runtime: "TS 5.x",
    template: `function solution(args: any): any {\n  // Write your code here\n  return null;\n}`,
  },
  python: {
    label: "Python",
    runtime: "Python 3.12",
    template: `def solution(args):\n    # Write your code here\n    pass`,
  },
  cpp: {
    label: "C++",
    runtime: "GCC 13",
    template: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // Write your code here\n    }\n};`,
  },
  java: {
    label: "Java",
    runtime: "OpenJDK 21",
    template: `import java.util.*;\n\nclass Solution {\n    public Object solution(Object args) {\n        // Write your code here\n        return null;\n    }\n}`,
  },
  csharp: {
    label: "C#",
    runtime: ".NET 8",
    template: `using System;\n\npublic class Solution {\n    public object Solve(object args) {\n        // Write your code here\n        return null;\n    }\n}`,
  },
  go: {
    label: "Go",
    runtime: "Go 1.22",
    template: `package main\n\nfunc solution(args interface{}) interface{} {\n    // Write your code here\n    return nil\n}`,
  },
  rust: {
    label: "Rust",
    runtime: "Rust 1.78",
    template: `pub fn solution(args: &str) -> Option<String> {\n    // Write your code here\n    None\n}`,
  },
  php: {
    label: "PHP",
    runtime: "PHP 8.3",
    template: `<?php\nfunction solution($args) {\n    // Write your code here\n    return null;\n}`,
  },
  ruby: {
    label: "Ruby",
    runtime: "Ruby 3.3",
    template: `def solution(args)\n  # Write your code here\n  nil\nend`,
  },
  swift: {
    label: "Swift",
    runtime: "Swift 5.10",
    template: `class Solution {\n    func solution(_ args: Any) -> Any? {\n        // Write your code here\n        return nil\n    }\n}`,
  },
  kotlin: {
    label: "Kotlin",
    runtime: "Kotlin 1.9",
    template: `class Solution {\n    fun solution(args: Any?): Any? {\n        // Write your code here\n        return null\n    }\n}`,
  },
  dart: {
    label: "Dart",
    runtime: "Dart 3.4",
    template: `dynamic solution(dynamic args) {\n  // Write your code here\n  return null;\n}`,
  },
  sql: {
    label: "SQL",
    runtime: "PostgreSQL 16",
    template: `-- Write your SQL query here\nSELECT * FROM table_name;`,
  },
};

export const POPULAR_LANGUAGE_SUGGESTIONS = [
  "javascript",
  "python",
  "typescript",
  "cpp",
  "java",
  "go",
  "rust",
  "csharp",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "sql",
];

export const getLanguageInfo = (langKey: string): LanguageInfo => {
  const lower = langKey.toLowerCase().trim();
  if (KNOWN_LANGUAGE_TEMPLATES[lower]) {
    return KNOWN_LANGUAGE_TEMPLATES[lower];
  }
  const formatted =
    langKey.trim().charAt(0).toUpperCase() + langKey.trim().slice(1);
  return {
    label: formatted,
    runtime: "Custom runtime",
    template: `// Starter code for ${formatted}\nfunction solution(args) {\n  // Write your code here\n  return null;\n}`,
  };
};

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
