"use client";

import { ArrowLeft, ArrowRight, KeyRound, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { useForgotPassword } from "@/app/hooks/auth.hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/validations/auth.validation";

export function ForgotPasswordForm() {
  const router = useRouter();
  const forgotMutation = useForgotPassword();

  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ||
          "Please enter a valid email address.",
      );
      return;
    }

    try {
      await forgotMutation.mutateAsync({ email: validation.data.email });
      toast.success("Reset Code Sent", {
        description:
          "We sent a 6-digit password reset code to your registered email.",
      });

      router.push(
        `/reset-password?email=${encodeURIComponent(validation.data.email)}`,
      );
    } catch (err: unknown) {
      const errorResponse = err as {
        response?: { _data?: { message?: string } };
        data?: { message?: string };
        message?: string;
      };
      const msg =
        errorResponse?.response?._data?.message ||
        errorResponse?.data?.message ||
        errorResponse?.message ||
        "Could not send reset code. Please verify your email.";
      setError(msg);
      toast.error("Request Failed", { description: msg });
    }
  };

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1 pb-4 text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <KeyRound className="size-6" />
        </div>
        <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
        <CardDescription className="text-xs">
          Enter your registered email and we&apos;ll send you an OTP to reset
          your password
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email" required>
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="developer@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                error={!!error}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 font-semibold shadow-md shadow-primary/20"
            disabled={forgotMutation.isPending}
          >
            {forgotMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending Reset Code...
              </>
            ) : (
              <>
                Send Verification Code
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 py-4 text-xs text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
