"use client";

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { useResetPassword } from "@/app/hooks/auth.hooks";
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
import { cn } from "@/lib/utils";
import {
  passwordRegex,
  resetPasswordSchema,
} from "@/validations/auth.validation";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email") || "";

  const resetMutation = useResetPassword();

  const [email, setEmail] = React.useState(urlEmail);
  const [otp, setOtp] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  // Password Strength Calculation
  const passwordChecks = React.useMemo(() => {
    return {
      length: newPassword.length >= 8,
      upper: passwordRegex.uppercase.test(newPassword),
      lower: passwordRegex.lowercase.test(newPassword),
      number: passwordRegex.number.test(newPassword),
      special: passwordRegex.special.test(newPassword),
    };
  }, [newPassword]);

  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = resetPasswordSchema.safeParse({
      email,
      otp,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await resetMutation.mutateAsync({
        email: result.data.email,
        otp: result.data.otp,
        newPassword: result.data.newPassword,
      });

      toast.success("Password Updated Successfully!", {
        description: "You can now log in using your new credentials.",
      });

      router.push(`/login?email=${encodeURIComponent(email)}&reset=success`);
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
        "Failed to reset password. The code may be invalid or expired.";
      toast.error("Reset Failed", { description: msg });
      setErrors({ form: msg });
    }
  };

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1 pb-4 text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
          <ShieldCheck className="size-6" />
        </div>
        <CardTitle className="text-xl font-bold">Set New Password</CardTitle>
        <CardDescription className="text-xs">
          Enter the 6-digit code and choose a secure new password
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errors.form && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive text-center">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="reset-email" required>
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="reset-email"
                type="email"
                placeholder="developer@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                error={!!errors.email}
                required
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.email}
              </p>
            )}
          </div>

          {/* 6 Digit OTP */}
          <div className="space-y-1.5">
            <Label htmlFor="reset-otp" required>
              6-Digit Reset Code
            </Label>
            <Input
              id="reset-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="text-center tracking-widest font-bold text-base"
              error={!!errors.otp}
              required
            />
            {errors.otp && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.otp}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reset-new-pwd" required>
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="reset-new-pwd"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-9 pr-9"
                error={!!errors.newPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reset-conf-pwd" required>
              Confirm New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="reset-conf-pwd"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9 pr-9"
                error={!!errors.confirmPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Strength bar */}
          {newPassword.length > 0 && (
            <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between font-medium">
                <span className="text-muted-foreground">
                  Password Strength:
                </span>
                <span
                  className={cn(
                    "font-semibold",
                    passwordScore <= 2 && "text-destructive",
                    passwordScore === 3 || passwordScore === 4
                      ? "text-amber-500"
                      : "",
                    passwordScore === 5 && "text-emerald-500",
                  )}
                >
                  {passwordScore <= 2
                    ? "Weak"
                    : passwordScore < 5
                      ? "Moderate"
                      : "Strong"}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-1 rounded-full transition-all",
                      passwordScore >= level
                        ? passwordScore <= 2
                          ? "bg-destructive"
                          : passwordScore < 5
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        : "bg-border/60",
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-10 font-semibold shadow-md shadow-primary/20"
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              <>
                Update Password
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
