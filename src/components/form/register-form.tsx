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
import { useRouter } from "next/navigation";
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
  const [role, setRole] = React.useState<AccountRole>("DEVELOPER");

  // Mutations
  const devRegisterMutation = useDeveloperRegistration();
  const recruiterRegisterMutation = useRecruiterRegistration();
  const isSubmitting =
    devRegisterMutation.isPending || recruiterRegisterMutation.isPending;

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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                        setDevData({ ...devData, portfolioUrl: e.target.value })
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
        ) : (
          /* RECRUITER REGISTRATION FORM */
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
                    setRecruiterData({ ...recruiterData, name: e.target.value })
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
                I confirm I am an authorized hiring representative and agree to
                the{" "}
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
