import { z } from "zod";

// 1. Start Assessment Validation
export const startAssessmentSchema = z
  .object({
    inviteToken: z.string().optional(),
    assessmentId: z.string().optional(),
  })
  .refine((data) => data.inviteToken || data.assessmentId, {
    message: "Either invite token or assessment ID must be provided",
  });

export type StartAssessmentFormData = z.infer<typeof startAssessmentSchema>;

// 2. Submit / Save Answer Validation
export const submitAnswerSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  selectedOption: z.string().optional(),
  code: z.string().optional(),
  submittedCode: z.string().optional(),
  language: z.string().optional().default("javascript"),
  passedTestCases: z.number().optional().default(0),
  totalTestCases: z.number().optional().default(0),
});

export type SubmitAnswerFormData = z.infer<typeof submitAnswerSchema>;

// 3. Live Run Code Validation
export const runCodeSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  code: z.string().min(1, "Code cannot be empty"),
  language: z.string().optional().default("javascript"),
});

export type RunCodeFormData = z.infer<typeof runCodeSchema>;

// 4. Proctor Event Validation
export const proctorEventSchema = z.object({
  eventType: z.enum([
    "TAB_SWITCH",
    "COPY_PASTE",
    "WINDOW_BLUR",
    "FULLSCREEN_EXIT",
  ]),
  details: z.any().optional(),
});

export type ProctorEventFormData = z.infer<typeof proctorEventSchema>;

// 5. Review Submission Validation (Recruiter / Admin)
export const reviewSubmissionSchema = z.object({
  feedback: z
    .string()
    .max(2000, "Feedback cannot exceed 2000 characters")
    .optional(),
  totalScore: z.coerce
    .number()
    .min(0, "Score cannot be negative")
    .max(1000, "Score is too high")
    .optional(),
});

export type ReviewSubmissionFormData = z.infer<typeof reviewSubmissionSchema>;
