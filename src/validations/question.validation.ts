import { z } from "zod";

export const testCaseSchema = z.object({
  id: z.string().optional(),
  input: z.string().min(1, "Test case input is required"),
  output: z.string().min(1, "Test case output is required"),
  expectedOutput: z.any().optional(),
  isHidden: z.boolean().optional().default(false),
  explanation: z.string().optional(),
});

export const mcqOptionSchema = z.object({
  id: z.string().default("A"),
  text: z.string().min(1, "Option text cannot be empty"),
});

export const createQuestionSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    type: z.enum(["CODING", "MCQ"]),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    tags: z.array(z.string()).default([]),
    problemStatement: z
      .string()
      .min(5, "Problem statement must be at least 5 characters long"),
    constraints: z.string().optional().nullable(),
    starterCode: z.any().optional(),
    testCases: z.array(testCaseSchema).optional(),
    mcqOptions: z.array(mcqOptionSchema).optional(),
    correctOption: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.type === "CODING") {
        return Boolean(data.testCases && data.testCases.length > 0);
      }
      return true;
    },
    {
      message: "At least one valid test case is required for coding challenges",
      path: ["testCases"],
    },
  )
  .refine(
    (data) => {
      if (data.type === "MCQ") {
        return (
          Boolean(data.mcqOptions && data.mcqOptions.length >= 2) &&
          Boolean(data.correctOption && data.correctOption.length > 0)
        );
      }
      return true;
    },
    {
      message: "At least 2 options and 1 correct option are required for MCQs",
      path: ["correctOption"],
    },
  );

export type CreateQuestionFormData = z.infer<typeof createQuestionSchema>;

export const updateQuestionSchema = z.object({
  title: z.string().min(3).optional(),
  type: z.enum(["CODING", "MCQ"]).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  tags: z.array(z.string()).optional(),
  problemStatement: z.string().min(5).optional(),
  constraints: z.string().optional().nullable(),
  starterCode: z.any().optional(),
  testCases: z.array(testCaseSchema).optional(),
  mcqOptions: z.array(mcqOptionSchema).optional(),
  correctOption: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type UpdateQuestionFormData = z.infer<typeof updateQuestionSchema>;
