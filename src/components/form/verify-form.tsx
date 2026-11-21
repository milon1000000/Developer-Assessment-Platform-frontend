"use client";

import {
  ArrowRight,
  CheckCircle2,
  Edit2,
  Loader2,
  Mail,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  useForgotPassword,
  useRecruiterVerification,
  useVerification,
} from "@/app/hooks/auth.hooks";
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
import { cn } from "@/lib/utils";
import { verifyEmailSchema } from "@/validations/auth.validation";

export function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlEmail = searchParams.get("email") || "";
  const role = searchParams.get("role") || "DEVELOPER";

  const [email, setEmail] = React.useState(urlEmail);
  const [isEditingEmail, setIsEditingEmail] = React.useState(!urlEmail);
  const [otpDigits, setOtpDigits] = React.useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [timer, setTimer] = React.useState(60);
  const [isResending, setIsResending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Mutations
  const verifyDevMutation = useVerification();
  const verifyRecruiterMutation = useRecruiterVerification();
  const resendMutation = useForgotPassword();

  const isSubmitting =
    verifyDevMutation.isPending || verifyRecruiterMutation.isPending;

  // Countdown timer
  React.useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Keep inputRefs in sync
  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  const handleDigitChange = (index: number, value: string) => {
    if (error) setError(null);

    // Only allow single numeric character
    const sanitized = value.replace(/\D/g, "");
    if (!sanitized) {
      const nextDigits = [...otpDigits];
      nextDigits[index] = "";
      setOtpDigits(nextDigits);
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = sanitized[sanitized.length - 1]; // take latest char
    setOtpDigits(nextDigits);

    // Auto advance to next input
    if (index < 5 && sanitized) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text/plain")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData.length > 0) {
      const nextDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        nextDigits[i] = pastedData[i] || "";
      }
      setOtpDigits(nextDigits);

      const focusIdx = Math.min(pastedData.length, 5);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  const fullOtp = otpDigits.join("");

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const validation = verifyEmailSchema.safeParse({ email, otp: fullOtp });
    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ||
          "Please enter a complete 6-digit code.",
      );
      return;
    }

    try {
      if (role === "RECRUITER") {
        await verifyRecruiterMutation.mutateAsync({
          email: validation.data.email,
          otp: validation.data.otp,
        });
      } else {
        await verifyDevMutation.mutateAsync({
          email: validation.data.email,
          otp: validation.data.otp,
        });
      }

      toast.success("Account Verified Successfully!", {
        description: "Your email has been confirmed. You can now sign in.",
      });

      router.push(`/login?verified=true&email=${encodeURIComponent(email)}`);
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
        "Invalid or expired verification code.";
      setError(msg);
      toast.error("Verification Failed", { description: msg });
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;
    if (!email) {
      toast.error("Please provide your email address.");
      return;
    }

    setIsResending(true);
    try {
      await resendMutation.mutateAsync({ email });
      setTimer(60);
      toast.success("New Code Sent", {
        description: "A fresh verification code was sent to your email inbox.",
      });
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
        "Failed to resend code. Please try again.";
      toast.error("Resend Error", { description: msg });
    } finally {
      setIsResending(false);
    }
  };

  // Masked email preview
  const maskedEmail = React.useMemo(() => {
    if (!email || !email.includes("@")) return email;
    const [name, domain] = email.split("@");
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name[0]}${"*".repeat(Math.max(name.length - 2, 3))}${name[name.length - 1]}@${domain}`;
  }, [email]);

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1 pb-4 text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <ShieldCheck className="size-6" />
        </div>
        <CardTitle className="text-xl font-bold">Verify Your Email</CardTitle>
        <CardDescription className="text-xs">
          We sent a 6-digit confirmation code to your inbox
        </CardDescription>

        {/* Email Display & Edit */}
        <div className="pt-2">
          {isEditingEmail ? (
            <div className="flex items-center gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@domain.com"
                className="h-8 text-xs text-center"
              />
              <Button
                size="xs"
                variant="outline"
                onClick={() => setIsEditingEmail(false)}
                className="h-8 text-xs"
              >
                Save
              </Button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3 py-1 text-xs font-medium text-foreground">
              <Mail className="size-3 text-muted-foreground" />
              <span>{maskedEmail || "No email specified"}</span>
              <button
                type="button"
                onClick={() => setIsEditingEmail(true)}
                className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Change email"
              >
                <Edit2 className="size-2.5" />
              </button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          {/* 6 Digit Input Group */}
          <div className="flex justify-center items-center gap-2 sm:gap-2.5">
            {otpDigits.map((digit, idx) => (
              <input
                key={`otp-slot-${idx}`}
                ref={setInputRef(idx)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className={cn(
                  "size-11 sm:size-12 rounded-xl border text-center text-lg font-bold shadow-xs transition-all outline-none",
                  "bg-background/80 text-foreground",
                  digit
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-input hover:border-border",
                  "focus:border-primary focus:ring-3 focus:ring-primary/30",
                  error && "border-destructive focus:ring-destructive/20",
                )}
              />
            ))}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-10 font-semibold shadow-md shadow-primary/20"
            disabled={isSubmitting || fullOtp.length !== 6}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Verifying Code...
              </>
            ) : (
              <>
                Confirm & Activate Account
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </form>

        {/* Resend Cooldown Section */}
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3.5 py-2.5 text-xs">
          <span className="text-muted-foreground">Didn&apos;t get code?</span>
          {timer > 0 ? (
            <span className="font-medium text-muted-foreground">
              Resend in <strong className="text-foreground">{timer}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1 disabled:opacity-50"
            >
              {isResending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <RotateCcw className="size-3" />
              )}
              Resend Code
            </button>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 py-4 text-xs text-muted-foreground">
        <div>
          Wrong account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
