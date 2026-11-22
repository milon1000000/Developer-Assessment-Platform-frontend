import { z } from "zod";

// Password strength rules matching backend requirements
export const passwordRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

export const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(passwordRegex.uppercase, "Must include at least 1 uppercase letter")
  .regex(passwordRegex.lowercase, "Must include at least 1 lowercase letter")
  .regex(passwordRegex.number, "Must include at least 1 number")
  .regex(
    passwordRegex.special,
    "Must include at least 1 special character (!@#$%^&*)",
  );

// 1. User Login
export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// 2. Developer Registration
export const developerRegisterSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.string().trim().email("Please enter a valid email address"),
    password: passwordValidation,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: z.string().trim().optional(),
    skills: z.string().trim().optional(), // Entered as comma-separated in UI, transformed to array
    experienceYears: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const num = Number(val);
        return Number.isNaN(num) ? undefined : num;
      }),
    githubUrl: z
      .string()
      .trim()
      .url("Please enter a valid GitHub URL")
      .or(z.literal(""))
      .optional(),
    portfolioUrl: z
      .string()
      .trim()
      .url("Please enter a valid portfolio URL")
      .or(z.literal(""))
      .optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and privacy policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type DeveloperRegisterFormData = z.infer<typeof developerRegisterSchema>;

// 3. Recruiter Registration
export const recruiterRegisterSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid business email address"),
  companyName: z.string().trim().min(2, "Company name is required"),
  designation: z.string().trim().optional(),
  companyWebsite: z
    .string()
    .trim()
    .url("Please enter a valid website URL (e.g. https://company.com)")
    .or(z.literal(""))
    .optional(),
  phone: z.string().trim().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and privacy policy",
  }),
});

export type RecruiterRegisterFormData = z.infer<typeof recruiterRegisterSchema>;

// 4. Email / Account Verification (OTP)
export const verifyEmailSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  otp: z
    .string()
    .trim()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only numbers"),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

// 5. Forgot Password
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter your registered email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// 6. Reset Password
export const resetPasswordSchema = z
  .object({
    email: z.string().trim().email("Invalid email address"),
    otp: z
      .string()
      .trim()
      .length(6, "Verification code must be exactly 6 digits")
      .regex(/^\d{6}$/, "Verification code must contain only numbers"),
    newPassword: passwordValidation,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// 7. Change Password
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordValidation,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// 8. Update Profile Schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Full Name must be at least 2 characters")
    .max(50, "Full Name cannot exceed 50 characters"),
  phone: z.string().optional(),
  experienceYears: z.coerce
    .number()
    .min(0, "Experience cannot be negative")
    .max(50, "Experience exceeds maximum limit")
    .optional(),
  skills: z.array(z.string()).optional(),
  githubUrl: z
    .string()
    .url("Please enter a valid GitHub URL (e.g. https://github.com/username)")
    .optional()
    .or(z.literal("")),
  portfolioUrl: z
    .string()
    .url("Please enter a valid portfolio URL (e.g. https://domain.com)")
    .optional()
    .or(z.literal("")),
  resumeUrl: z
    .string()
    .url("Please enter a valid resume URL")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
