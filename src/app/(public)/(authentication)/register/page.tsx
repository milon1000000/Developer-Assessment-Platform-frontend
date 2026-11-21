import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/form/register-form";

export const metadata: Metadata = {
  title: "Create Account | DevAssess Platform",
  description:
    "Join DevAssess as a Developer or Recruiter for automated live code screening.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create Account"
      subtitle="Join top engineering teams and developers on the leading screening platform"
      badgeText="Developer & Recruiter Onboarding"
    >
      <RegisterForm />
    </AuthShell>
  );
}
