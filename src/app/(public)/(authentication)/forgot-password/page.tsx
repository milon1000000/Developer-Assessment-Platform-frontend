import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/form/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | DevAssess Platform",
  description: "Recover access to your DevAssess account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Account Recovery"
      subtitle="Enter your email to receive a password reset verification code"
      badgeText="Credential Recovery"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
