"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useChangePassword, useCurrentUser } from "@/app/hooks/auth.hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePasswordSchema,
  passwordRegex,
  setPasswordSchema,
} from "@/validations/auth.validation";
import type { IUser } from "@/types/auth.type";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function ChangePasswordForm() {
  const { data: userData } = useCurrentUser();
  const changePasswordMutation = useChangePassword();

  const rawData = userData?.data;
  const currentUser: IUser | undefined =
    (rawData as { user?: IUser } | undefined)?.user ||
    (rawData as IUser | undefined);
  const hasPassword = Boolean(currentUser?.hasPassword);

  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  // Dynamic Password Strength Evaluation
  const passwordChecks = React.useMemo(() => {
    return {
      length: newPassword.length >= 8,
      uppercase: passwordRegex.uppercase.test(newPassword),
      lowercase: passwordRegex.lowercase.test(newPassword),
      number: passwordRegex.number.test(newPassword),
      special: passwordRegex.special.test(newPassword),
    };
  }, [newPassword]);

  const strengthScore = Object.values(passwordChecks).filter(Boolean).length;

  const strengthDetails = React.useMemo(() => {
    if (newPassword.length === 0) {
      return {
        text: "None",
        color: "bg-muted text-muted-foreground",
        width: 0,
      };
    }
    if (strengthScore <= 2) {
      return {
        text: "Weak",
        color: "bg-destructive text-destructive",
        width: 25,
      };
    }
    if (strengthScore === 3) {
      return {
        text: "Fair",
        color: "bg-amber-500 text-amber-500",
        width: 50,
      };
    }
    if (strengthScore === 4) {
      return {
        text: "Good",
        color: "bg-blue-500 text-blue-500",
        width: 75,
      };
    }
    return {
      text: "Strong",
      color: "bg-emerald-500 text-emerald-500",
      width: 100,
    };
  }, [strengthScore, newPassword]);

  const isMatching =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const isMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleReset = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // If user has no password set (e.g. Google user), validate without oldPassword
    if (!hasPassword) {
      const validation = setPasswordSchema.safeParse({
        newPassword,
        confirmPassword,
      });

      if (!validation.success) {
        const fieldErrors: { [key: string]: string } = {};
        for (const issue of validation.error.issues) {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message;
          }
        }
        setErrors(fieldErrors);
        toast.error("Validation Error", {
          description: "Please fulfill all password security requirements.",
        });
        return;
      }

      try {
        const res = await changePasswordMutation.mutateAsync({
          newPassword: validation.data.newPassword,
        });

        toast.success("Password Set Successfully!", {
          description:
            res?.message ||
            "You can now sign in with either Google or your email & password.",
        });

        handleReset();
      } catch (err: unknown) {
        const errorResponse = err as {
          response?: { _data?: { message?: string } };
          data?: { message?: string };
          message?: string;
        };
        const errorMsg =
          errorResponse?.response?._data?.message ||
          errorResponse?.data?.message ||
          errorResponse?.message ||
          "Failed to set password. Please try again.";

        toast.error("Password Setup Failed", { description: errorMsg });
        setErrors({ form: errorMsg });
      }
      return;
    }

    // User already has a password, change password with current password
    const validation = changePasswordSchema.safeParse({
      oldPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      setErrors(fieldErrors);
      toast.error("Validation Error", {
        description: "Please check your current and new password.",
      });
      return;
    }

    try {
      const res = await changePasswordMutation.mutateAsync({
        oldPassword: validation.data.oldPassword,
        newPassword: validation.data.newPassword,
      });

      toast.success("Password Updated Successfully!", {
        description:
          res?.message ||
          "Your account password has been updated. Please remember your new credentials.",
      });

      handleReset();
    } catch (err: unknown) {
      const errorResponse = err as {
        response?: { _data?: { message?: string } };
        data?: { message?: string };
        message?: string;
      };
      const errorMsg =
        errorResponse?.response?._data?.message ||
        errorResponse?.data?.message ||
        errorResponse?.message ||
        "Failed to update password. Please verify your current password.";

      toast.error("Password Change Failed", {
        description: errorMsg,
      });
      setErrors({ form: errorMsg });
    }
  };

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute -right-24 -top-24 size-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      {/* Card Header */}
      <CardHeader className="space-y-2 pb-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/25 shadow-sm">
              <Shield className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                {hasPassword
                  ? "Change Account Password"
                  : "Set Account Password"}
              </CardTitle>
              <CardDescription className="text-xs">
                {hasPassword
                  ? "Update your credentials to maintain optimal account integrity and sandbox security"
                  : "You signed in via Google. Set a direct password to enable email & password sign-in alongside Google."}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              hasPassword
                ? "hidden sm:inline-flex border-violet-500/30 text-violet-400 bg-violet-500/10 text-[10px] py-0.5 px-2 font-semibold gap-1"
                : "hidden sm:inline-flex border-amber-500/30 text-amber-500 bg-amber-500/10 text-[10px] py-0.5 px-2 font-semibold gap-1"
            }
          >
            <ShieldCheck className="size-3" />
            {hasPassword
              ? "Security & Authentication"
              : "Google Account Linked"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        {/* Google User Notice Banner if no password is set */}
        {!hasPassword && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-500 flex items-start gap-3 leading-relaxed">
            <Sparkles className="size-4 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p className="font-semibold text-foreground">
                Google Single Sign-on Active
              </p>
              <p className="text-muted-foreground mt-0.5">
                Your account is authenticated via Google (
                <span className="text-foreground font-mono">
                  {currentUser?.email}
                </span>
                ). You do not currently have a password set. Set a secure
                password below to enable logging in via both Google and direct
                email/password credentials.
              </p>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errors.form && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2.5">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">
              {errors.form}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field 1: Current Password (ONLY shown if user already has a password) */}
          {hasPassword && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="old-password" required>
                  Current Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Forgot your current password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="old-password"
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="pl-9 pr-9"
                  error={!!errors.oldPassword}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showOldPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.oldPassword && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.oldPassword}
                </p>
              )}
            </div>
          )}

          {/* Field 2: New Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-password" required>
                {hasPassword ? "New Password" : "Create Account Password"}
              </Label>
              {newPassword.length > 0 && (
                <span className="text-[11px] font-semibold flex items-center gap-1 font-mono">
                  <span>Strength:</span>
                  <span className={strengthDetails.color.split(" ")[1]}>
                    {strengthDetails.text}
                  </span>
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder={
                  hasPassword
                    ? "Enter secure new password"
                    : "Create a strong password"
                }
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-9 pr-9"
                error={!!errors.newPassword}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? (
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

            {/* Interactive Strength Meter Bars */}
            {newPassword.length > 0 && (
              <div className="pt-1.5 space-y-2">
                <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      strengthScore >= 1
                        ? strengthDetails.color.split(" ")[0]
                        : "bg-muted"
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      strengthScore >= 2
                        ? strengthDetails.color.split(" ")[0]
                        : "bg-muted"
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      strengthScore >= 4
                        ? strengthDetails.color.split(" ")[0]
                        : "bg-muted"
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      strengthScore === 5
                        ? strengthDetails.color.split(" ")[0]
                        : "bg-muted"
                    }`}
                  />
                </div>

                {/* 5-Item Criteria Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordChecks.length
                        ? "text-emerald-500 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Check
                      className={`size-3.5 ${
                        passwordChecks.length
                          ? "text-emerald-500"
                          : "opacity-30"
                      }`}
                    />
                    <span>At least 8 characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordChecks.uppercase
                        ? "text-emerald-500 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Check
                      className={`size-3.5 ${
                        passwordChecks.uppercase
                          ? "text-emerald-500"
                          : "opacity-30"
                      }`}
                    />
                    <span>1 uppercase letter (A-Z)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordChecks.lowercase
                        ? "text-emerald-500 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Check
                      className={`size-3.5 ${
                        passwordChecks.lowercase
                          ? "text-emerald-500"
                          : "opacity-30"
                      }`}
                    />
                    <span>1 lowercase letter (a-z)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordChecks.number
                        ? "text-emerald-500 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Check
                      className={`size-3.5 ${
                        passwordChecks.number
                          ? "text-emerald-500"
                          : "opacity-30"
                      }`}
                    />
                    <span>At least 1 number (0-9)</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 sm:col-span-2 ${
                      passwordChecks.special
                        ? "text-emerald-500 font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Check
                      className={`size-3.5 ${
                        passwordChecks.special
                          ? "text-emerald-500"
                          : "opacity-30"
                      }`}
                    />
                    <span>1 special symbol (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Field 3: Confirm New Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="confirm-password" required>
                Confirm Password
              </Label>
              {isMatching && (
                <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  Passwords match
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9 pr-9"
                error={!!errors.confirmPassword || isMismatch}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
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
            {isMismatch && !errors.confirmPassword && (
              <p className="text-[11px] text-destructive font-medium">
                Passwords do not match.
              </p>
            )}
          </div>

          {/* Security Notice Callout */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground flex items-start gap-2.5 leading-relaxed">
            <ShieldAlert className="size-4 shrink-0 text-primary mt-0.5" />
            <span>
              {hasPassword
                ? "For your account protection, changing your password will automatically invalidate all other active sessions and access tokens."
                : "Setting a password adds direct email and password authentication to your account, allowing seamless login with or without Google."}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={changePasswordMutation.isPending}
              className="text-xs font-semibold gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Reset Form
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={changePasswordMutation.isPending}
              className="text-xs font-semibold shadow-md shadow-primary/20 gap-1.5 min-w-36"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  {hasPassword ? "Updating Password..." : "Setting Password..."}
                </>
              ) : (
                <>
                  <Lock className="size-3.5" />
                  {hasPassword ? "Change Password" : "Set Account Password"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
