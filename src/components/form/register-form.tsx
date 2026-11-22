"use client";

import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Code2,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import {
  useDeveloperRegistration,
  useRecruiterRegistration,
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  developerRegisterSchema,
  passwordRegex,
  recruiterRegisterSchema,
} from "@/validations/auth.validation";

type AccountRole = "DEVELOPER" | "RECRUITER";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = React.useState<AccountRole>("DEVELOPER");
  const [isGoogleRedirecting, setIsGoogleRedirecting] = React.useState(false);

  // Capture OAuth redirect errors or messages from backend
  React.useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setErrors((prev) => ({ ...prev, form: errorParam }));
      toast.error("Registration Notice", {
        description: errorParam,
      });

      if (typeof window !== "undefined") {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }
    }
  }, [searchParams]);

  // Mutations
  const devRegisterMutation = useDeveloperRegistration();
  const recruiterRegisterMutation = useRecruiterRegistration();
  const isSubmitting =
    devRegisterMutation.isPending || recruiterRegisterMutation.isPending;

  const handleGoogleLogin = () => {
    setIsGoogleRedirecting(true);
    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
    window.location.href = `${backendUrl}/auth/google`;
  };

  // Developer Form State
  const [devData, setDevData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    experienceYears: "",
    skills: "",
    githubUrl: "",
    portfolioUrl: "",
    agreeToTerms: false,
  });

  // Recruiter Form State
  const [recruiterData, setRecruiterData] = React.useState({
    name: "",
    email: "",
    companyName: "",
    designation: "",
    companyWebsite: "",
    phone: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  // Password Strength Calculation
  const passwordChecks = React.useMemo(() => {
    const pwd = devData.password;
    return {
      length: pwd.length >= 8,
      upper: passwordRegex.uppercase.test(pwd),
      lower: passwordRegex.lowercase.test(pwd),
      number: passwordRegex.number.test(pwd),
      special: passwordRegex.special.test(pwd),
    };
  }, [devData.password]);

  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;

  const handleDevSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = developerRegisterSchema.safeParse(devData);
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
      const payloadSkills = devData.skills
        ? devData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      await devRegisterMutation.mutateAsync({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
        phone: result.data.phone || undefined,
        experienceYears: result.data.experienceYears,
        skills: payloadSkills,
        githubUrl: result.data.githubUrl || undefined,
        portfolioUrl: result.data.portfolioUrl || undefined,
      });

      toast.success("Account created successfully!", {
        description:
          "We sent a 6-digit verification code to your email address.",
      });

      router.push(
        `/account-verify?email=${encodeURIComponent(result.data.email)}&role=DEVELOPER`,
      );
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
        "Registration failed. Please check your details.";
      toast.error("Registration Error", { description: errorMsg });
      setErrors({ form: errorMsg });
    }
  };

  const handleRecruiterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = recruiterRegisterSchema.safeParse(recruiterData);
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
      await recruiterRegisterMutation.mutateAsync({
        name: result.data.name,
        email: result.data.email,
        companyName: result.data.companyName,
        designation: result.data.designation || undefined,
        companyWebsite: result.data.companyWebsite || undefined,
        phone: result.data.phone || undefined,
      });

      toast.success("Recruiter registered successfully!", {
        description:
          "We sent a 6-digit verification code to your company email.",
      });

      router.push(
        `/account-verify?email=${encodeURIComponent(result.data.email)}&role=RECRUITER`,
      );
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
        "Recruiter registration failed. Please check your details.";
      toast.error("Registration Error", { description: errorMsg });
      setErrors({ form: errorMsg });
    }
  };

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-3 pb-4">
        {/* Role Toggle Switcher */}
        <div className="grid grid-cols-2 rounded-xl bg-muted/70 p-1 border border-border/60">
          <button
            type="button"
            onClick={() => {
              setRole("DEVELOPER");
              setErrors({});
            }}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all",
              role === "DEVELOPER"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Code2 className="size-3.5" />
            Developer / Candidate
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("RECRUITER");
              setErrors({});
            }}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all",
              role === "RECRUITER"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Building2 className="size-3.5" />
            Recruiter / Company
          </button>
        </div>

        <div className="space-y-0.5">
          <CardTitle className="text-xl font-bold">
            {role === "DEVELOPER"
              ? "Create Developer Profile"
              : "Register as Recruiter"}
          </CardTitle>
          <CardDescription className="text-xs">
            {role === "DEVELOPER"
              ? "Showcase your coding skills and take live technical assessments."
              : "Evaluate candidates, launch screening tests, and hire top developers."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {errors.form && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {errors.form}
          </div>
        )}

        {role === "DEVELOPER" ? (
          /* DEVELOPER REGISTRATION FORM */
          <div className="space-y-4">
            {/* Google Developer Direct Sign-up */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 gap-2.5 border-border/80 bg-background/50 hover:bg-muted font-medium text-xs shadow-xs transition-all"
                onClick={handleGoogleLogin}
                disabled={isGoogleRedirecting || isSubmitting}
              >
                {isGoogleRedirecting ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                    <title>Google</title>
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {isGoogleRedirecting
                    ? "Connecting to Google..."
                    : "Sign up with Google (Developer only)"}
                </span>
              </Button>

              <div className="relative flex items-center justify-center pt-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <span className="relative bg-card px-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Or register with credentials
                </span>
              </div>
            </div>

            <form onSubmit={handleDevSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="dev-name" required>
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="dev-name"
                    placeholder="Alex Morgan"
                    value={devData.name}
                    onChange={(e) =>
                      setDevData({ ...devData, name: e.target.value })
                    }
                    className="pl-9"
                    error={!!errors.name}
                    required
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="dev-email" required>
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="dev-email"
                    type="email"
                    placeholder="alex@domain.com"
                    value={devData.email}
                    onChange={(e) =>
                      setDevData({ ...devData, email: e.target.value })
                    }
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

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dev-pwd" required>
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="dev-pwd"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={devData.password}
                      onChange={(e) =>
                        setDevData({ ...devData, password: e.target.value })
                      }
                      className="pl-9 pr-8"
                      error={!!errors.password}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dev-cpwd" required>
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="dev-cpwd"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={devData.confirmPassword}
                      onChange={(e) =>
                        setDevData({
                          ...devData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="pl-9 pr-8"
                      error={!!errors.confirmPassword}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {errors.password && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.password}
                </p>
              )}
              {errors.confirmPassword && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.confirmPassword}
                </p>
              )}

              {/* Password Strength Indicator */}
              {devData.password.length > 0 && (
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
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground pt-1">
                    <span
                      className={cn(
                        passwordChecks.length && "text-emerald-500 font-medium",
                      )}
                    >
                      • Min 8 characters
                    </span>
                    <span
                      className={cn(
                        passwordChecks.upper && "text-emerald-500 font-medium",
                      )}
                    >
                      • 1 uppercase letter
                    </span>
                    <span
                      className={cn(
                        passwordChecks.lower && "text-emerald-500 font-medium",
                      )}
                    >
                      • 1 lowercase letter
                    </span>
                    <span
                      className={cn(
                        passwordChecks.number &&
                          passwordChecks.special &&
                          "text-emerald-500 font-medium",
                      )}
                    >
                      • 1 number & 1 special
                    </span>
                  </div>
                </div>
              )}

              {/* Optional Developer Profile Attributes */}
              <details className="rounded-lg border border-border/60 bg-muted/20 p-2.5 group transition-all">
                <summary className="cursor-pointer text-xs font-semibold text-foreground/80 flex items-center justify-between select-none">
                  <span className="flex items-center gap-1.5">
                    <Award className="size-3.5 text-primary" />
                    Additional Developer Info (Optional)
                  </span>
                  <span className="text-[10px] text-muted-foreground group-open:rotate-90 transition-transform">
                    ▶
                  </span>
                </summary>
                <div className="mt-3 space-y-3 pt-2 border-t border-border/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="dev-exp">Experience (Years)</Label>
                      <Input
                        id="dev-exp"
                        type="number"
                        placeholder="e.g. 3"
                        min="0"
                        value={devData.experienceYears}
                        onChange={(e) =>
                          setDevData({
                            ...devData,
                            experienceYears: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dev-phone">Phone Number</Label>
                      <Input
                        id="dev-phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={devData.phone}
                        onChange={(e) =>
                          setDevData({ ...devData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="dev-skills">Primary Skills</Label>
                    <Input
                      id="dev-skills"
                      placeholder="TypeScript, React, Python, Go"
                      value={devData.skills}
                      onChange={(e) =>
                        setDevData({ ...devData, skills: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="dev-github">GitHub Profile</Label>
                      <Input
                        id="dev-github"
                        placeholder="https://github.com/username"
                        value={devData.githubUrl}
                        onChange={(e) =>
                          setDevData({ ...devData, githubUrl: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dev-portfolio">Portfolio / Website</Label>
                      <Input
                        id="dev-portfolio"
                        placeholder="https://yourportfolio.dev"
                        value={devData.portfolioUrl}
                        onChange={(e) =>
                          setDevData({
                            ...devData,
                            portfolioUrl: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </details>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="dev-terms"
                  checked={devData.agreeToTerms}
                  onChange={(e) =>
                    setDevData({ ...devData, agreeToTerms: e.target.checked })
                  }
                  className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary/40"
                />
                <label
                  htmlFor="dev-terms"
                  className="text-xs text-muted-foreground leading-snug cursor-pointer select-none"
                >
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.agreeToTerms}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-10 font-semibold shadow-md shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Developer Account
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        ) : (
          /* RECRUITER REGISTRATION FORM */
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
              <Building2 className="size-4 shrink-0 text-primary" />
              <span>
                Recruiter registration requires verified company credentials.
                Google sign-in is exclusively available for Developer
                candidates.
              </span>
            </div>
            <form onSubmit={handleRecruiterSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="rec-name" required>
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="rec-name"
                    placeholder="Sarah Jenkins"
                    value={recruiterData.name}
                    onChange={(e) =>
                      setRecruiterData({
                        ...recruiterData,
                        name: e.target.value,
                      })
                    }
                    className="pl-9"
                    error={!!errors.name}
                    required
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rec-email" required>
                  Work Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="rec-email"
                    type="email"
                    placeholder="sarah@techcorp.io"
                    value={recruiterData.email}
                    onChange={(e) =>
                      setRecruiterData({
                        ...recruiterData,
                        email: e.target.value,
                      })
                    }
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rec-company" required>
                    Company Name
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="rec-company"
                      placeholder="TechCorp Labs"
                      value={recruiterData.companyName}
                      onChange={(e) =>
                        setRecruiterData({
                          ...recruiterData,
                          companyName: e.target.value,
                        })
                      }
                      className="pl-9"
                      error={!!errors.companyName}
                      required
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rec-desig">Designation</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="rec-desig"
                      placeholder="Head of Talent"
                      value={recruiterData.designation}
                      onChange={(e) =>
                        setRecruiterData({
                          ...recruiterData,
                          designation: e.target.value,
                        })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rec-web">Company Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="rec-web"
                      type="url"
                      placeholder="https://techcorp.io"
                      value={recruiterData.companyWebsite}
                      onChange={(e) =>
                        setRecruiterData({
                          ...recruiterData,
                          companyWebsite: e.target.value,
                        })
                      }
                      className="pl-9"
                      error={!!errors.companyWebsite}
                    />
                  </div>
                  {errors.companyWebsite && (
                    <p className="text-[11px] text-destructive font-medium">
                      {errors.companyWebsite}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rec-phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="rec-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={recruiterData.phone}
                      onChange={(e) =>
                        setRecruiterData({
                          ...recruiterData,
                          phone: e.target.value,
                        })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rec-terms"
                  checked={recruiterData.agreeToTerms}
                  onChange={(e) =>
                    setRecruiterData({
                      ...recruiterData,
                      agreeToTerms: e.target.checked,
                    })
                  }
                  className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary/40"
                />
                <label
                  htmlFor="rec-terms"
                  className="text-xs text-muted-foreground leading-snug cursor-pointer select-none"
                >
                  I confirm I am an authorized hiring representative and agree
                  to the{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Recruiter Agreement
                  </Link>
                  .
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.agreeToTerms}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-10 font-semibold shadow-md shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Registering Recruiter...
                  </>
                ) : (
                  <>
                    Create Recruiter Account
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        <div>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
