import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/form/login-form";

export const metadata: Metadata = {
  title: "Sign In | DevAssess Platform",
  description:
    "Sign in to access your developer assessments and recruitment dashboard.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to access your assessments, candidates, and live coding challenges"
      badgeText="DevAssess Auth Gateway"
    >
      <Suspense
        fallback={
          <div className="flex h-64 w-full items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
