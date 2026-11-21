import { Loader2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyForm } from "@/components/form/verify-form";

export const metadata: Metadata = {
  title: "Verify Account | DevAssess Platform",
  description:
    "Confirm your email address using the 6-digit one-time verification code.",
};

export default function AccountVerifyPage() {
  return (
    <AuthShell
      title="Verify Account"
      subtitle="Complete your registration by confirming your email address"
      badgeText="Identity & Security Verification"
    >
      <Suspense
        fallback={
          <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        }
      >
        <VerifyForm />
      </Suspense>
    </AuthShell>
  );
}
