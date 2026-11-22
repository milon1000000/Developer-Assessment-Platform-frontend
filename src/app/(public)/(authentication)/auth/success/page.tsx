"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMe, logout } from "@/api/auth.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Code2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [developerName, setDeveloperName] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function verifyAndRedirect() {
      try {
        const errorParam = searchParams.get("error");
        if (errorParam) {
          throw new Error(errorParam);
        }

        // Invalidate current user query to pick up newly set cookies
        await queryClient.invalidateQueries({ queryKey: ["currentUser"] });

        // Retrieve authenticated user data
        const res = await getMe();
        const user = res?.data;

        if (!user) {
          throw new Error("Unable to retrieve user credentials.");
        }

        // STRICT VALIDATION: Only DEVELOPER role can sign in via Google
        if (user.role !== "DEVELOPER") {
          // If non-developer account was somehow reached, log out immediately
          await logout().catch(() => {});
          queryClient.clear();
          throw new Error(
            "Google sign-in is exclusively available for Developers. Please log in with your email and password.",
          );
        }

        if (isMounted) {
          const devName = user.developerProfile?.name || user.email;
          setDeveloperName(devName);
          setStatus("success");

          toast.success("Authentication Successful!", {
            description: `Welcome to DevAssess, ${devName}!`,
          });

          // Smooth transition to Developer Candidate Dashboard
          setTimeout(() => {
            router.replace("/candidate/dashboard");
          }, 1200);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorResponse = err as {
            response?: { _data?: { message?: string } };
            data?: { message?: string };
            message?: string;
          };
          const msg =
            errorResponse?.response?._data?.message ||
            errorResponse?.data?.message ||
            errorResponse?.message ||
            "Authentication failed. Please try signing in again.";
          setStatus("error");
          setErrorMessage(msg);
          toast.error("Google Authentication Notice", {
            description: msg,
          });
        }
      }
    }

    verifyAndRedirect();

    return () => {
      isMounted = false;
    };
  }, [searchParams, queryClient, router]);

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl max-w-md w-full mx-auto text-center">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex justify-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
            <Code2 className="size-6" />
          </div>
        </div>
        <CardTitle className="text-xl font-bold">
          {status === "verifying" && "Verifying Developer Account..."}
          {status === "success" && "Access Granted!"}
          {status === "error" && "Authentication Notice"}
        </CardTitle>
        <CardDescription className="text-xs">
          {status === "verifying" &&
            "Securing your session and loading your developer workspace."}
          {status === "success" &&
            `Redirecting ${developerName} to candidate assessment dashboard...`}
          {status === "error" &&
            "We could not complete your Google authentication."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pb-6">
        {status === "verifying" && (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground animate-pulse font-medium">
              Validating Developer role & workspace access...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="text-xs text-muted-foreground">
              Launching your assessment workspace...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2.5 text-left">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {errorMessage}
              </div>
            </div>

            <Button
              onClick={() =>
                router.replace(
                  `/login?error=${encodeURIComponent(errorMessage)}`,
                )
              }
              className="w-full text-xs h-9 font-semibold"
            >
              Return to Sign In
              <ArrowRight className="ml-2 size-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AuthSuccessPage() {
  return (
    <AuthShell
      title="Authenticating"
      subtitle="Connecting you to your secure developer assessment sandbox"
      badgeText="Google OAuth 2.0 Gateway"
    >
      <Suspense
        fallback={
          <div className="flex h-64 w-full items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <AuthSuccessContent />
      </Suspense>
    </AuthShell>
  );
}
