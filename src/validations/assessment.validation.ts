import { z } from "zod";
import {
  mcqOptionSchema,
  testCaseSchema,
} from "@/validations/question.validation";

// Question item schema inside an assessment
export const assessmentQuestionInputSchema = z.object({
  globalQuestionId: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  type: z.enum(["CODING", "MCQ"]).optional().default("CODING"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional().default("EASY"),
  problemStatement: z
    .string()
    .min(5, "Problem statement must be at least 5 characters")
    .optional(),
  constraints: z.string().optional().nullable(),
  starterCode: z.any().optional(),
  testCases: z.array(testCaseSchema).optional(),
  mcqOptions: z.array(mcqOptionSchema).optional(),
  correctOption: z.string().optional().nullable(),
  points: z.coerce.number().min(1, "Points must be at least 1").default(10),
  orderIndex: z.coerce.number().min(0).default(0),
});

export type AssessmentQuestionInputFormData = z.infer<
  typeof assessmentQuestionInputSchema
>;

// 1. Create Assessment Schema
export const createAssessmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().optional(),
  durationMinutes: z.coerce
    .number()
    .min(5, "Duration must be at least 5 minutes")
    .default(60),
  passingScore: z.coerce
    .number()
    .min(0, "Passing score cannot be negative")
    .max(100, "Passing score cannot exceed 100")
    .default(60),
  maxTabSwitches: z.coerce
    .number()
    .min(0, "Max tab switches cannot be negative")
    .default(3),
  expiresAt: z.string().optional(),
  questions: z.array(assessmentQuestionInputSchema).optional().default([]),
});

export type CreateAssessmentFormData = z.infer<typeof createAssessmentSchema>;

// 2. Update Assessment Schema
export const updateAssessmentSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  durationMinutes: z.coerce
    .number()
    .min(5, "Duration must be at least 5 minutes")
    .optional(),
  passingScore: z.coerce.number().min(0).max(100).optional(),
  maxTabSwitches: z.coerce.number().min(0).optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateAssessmentFormData = z.infer<typeof updateAssessmentSchema>;

// 3. Add Questions Schema
export const addQuestionsToAssessmentSchema = z.object({
  questions: z
    .array(assessmentQuestionInputSchema)
    .min(1, "At least one question is required"),
});

export type AddQuestionsToAssessmentFormData = z.infer<
  typeof addQuestionsToAssessmentSchema
>;

// 4. Send Assessment Invite Schema
export const sendAssessmentInviteSchema = z.object({
  assessmentId: z.string().min(1, "Assessment ID is required"),
  emails: z
    .array(z.string().email("Invalid email address format"))
    .min(1, "Please provide at least one valid candidate email"),
  expiresAt: z.string().optional(),
});

export type SendAssessmentInviteFormData = z.infer<
  typeof sendAssessmentInviteSchema
>;
