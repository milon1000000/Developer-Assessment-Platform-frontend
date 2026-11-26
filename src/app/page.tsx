"use client";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Cpu,
  FileCheck2,
  KeyRound,
  LayoutDashboard,
  Lock,
  Mail,
  Play,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Timer,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/app/hooks/auth.hooks";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PLATFORM_METRICS = [
  {
    value: "14",
    label: "Language Templates",
    detail: "JS, TS, Python, C++, Java, Go, Rust & SQL",
  },
  {
    value: "2",
    label: "Assessment Modes",
    detail: "Live Coding Challenges & Timed MCQs",
  },
  {
    value: "4",
    label: "Proctoring Signals",
    detail: "Tab Switch, Blur, Copy-Paste & Fullscreen",
  },
  {
    value: "3",
    label: "Role Workspaces",
    detail: "Candidate, Recruiter & Admin Portals",
  },
] as const;

const CORE_FEATURES = [
  {
    title: "Global Question Bank & Studio",
    description:
      "Author reusable Coding and MCQ questions with Easy, Medium, and Hard tiers, searchable tags, constraints, and hidden test suites.",
    icon: Code2,
    accent: "bg-primary/10 text-primary",
  },
  {
    title: "Sandboxed Test-Case Runner",
    description:
      "Run candidate solutions in an isolated Node.js VM context with 2.5s execution timeouts against sample and hidden grading cases.",
    icon: Cpu,
    accent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Real-Time Anti-Cheat Engine",
    description:
      "Monitor TAB_SWITCH, COPY_PASTE, WINDOW_BLUR, and FULLSCREEN_EXIT events with configurable max-switch auto-disqualification.",
    icon: ShieldCheck,
    accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Tokenized Email Invitations",
    description:
      "Send bulk candidate invites with cryptographic UUID tokens, expiry schedules, one-click resend, and a verified exam gateway.",
    icon: Mail,
    accent: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  {
    title: "Scorecards & Manual Calibration",
    description:
      "Combine automated test-case and MCQ scoring with recruiter code inspection, score overrides, and personalized feedback notes.",
    icon: ClipboardCheck,
    accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    title: "RBAC & Security Audit Trail",
    description:
      "Enforce strict Admin, Recruiter, and Developer permissions with JWT rotation, Google OAuth 2.0, and immutable audit event logs.",
    icon: Lock,
    accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
] as const;

const WORKSPACE_ROLES = [
  {
    role: "Developer",
    tagline: "Candidate Exam Arena",
    icon: Terminal,
    badge: "Live IDE",
    points: [
      "Verify invite token & inspect exam rules",
      "Write & run code against sample test cases",
      "Auto-save answers with continuous countdown",
      "View graded scorecards & recruiter feedback",
    ],
  },
  {
    role: "Recruiter",
    tagline: "Hiring & Assessment Suite",
    icon: Building2,
    badge: "Talent Ops",
    points: [
      "Create timed MCQ & Coding assessments",
      "Distribute & track candidate email invites",
      "Inspect code diffs & proctoring telemetry",
      "Adjust final scores & publish review notes",
    ],
  },
  {
    role: "Admin",
    tagline: "System Control Center",
    icon: ShieldAlert,
    badge: "Governance",
    points: [
      "Manage Global Question Bank repository",
      "Approve or reject recruiter applications",
      "Control user status & platform directory",
      "Monitor real-time Security Audit Logs",
    ],
  },
] as const;

const SAMPLE_TEST_CASES = [
  { id: "tc-1", name: "Sample Case #1", status: "Passed", time: "3 ms" },
  { id: "tc-2", name: "Sample Case #2", status: "Passed", time: "4 ms" },
  {
    id: "tc-3",
    name: "Hidden Edge Suite (4/4)",
    status: "Passed",
    time: "11 ms",
  },
] as const;

export default function HomePage() {
  const { data: currentUserData, isLoading: isUserLoading } = useCurrentUser();

  const rawUser = currentUserData?.data as {
    user?: {
      role?: string;
      email?: string;
    };
    role?: string;
    email?: string;
  } | null;

  const user = rawUser?.user || rawUser;
  const isAuthenticated = !isUserLoading && !!(user?.email || rawUser?.email);
  const role = user?.role || rawUser?.role;

  const dashboardHref =
    role === "ADMIN"
      ? "/admin/dashboard"
      : role === "RECRUITER"
        ? "/recruiter/dashboard"
        : "/candidate/dashboard";

  const roleLabel =
    role === "ADMIN"
      ? "Admin"
      : role === "RECRUITER"
        ? "Recruiter"
        : "Developer";

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Ambient Background Glows & Grid */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[140px] dark:bg-primary/15" />
        <div className="absolute top-1/3 -right-40 h-[580px] w-[580px] rounded-full bg-indigo-500/10 blur-[150px] dark:bg-indigo-500/15" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[140px] dark:bg-violet-600/10" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <PublicNavbar />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16 space-y-12 sm:space-y-16 lg:space-y-20">
        {/* 1. Hero Section */}
        <section className="grid items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7 min-w-0 space-y-5 sm:space-y-6">
            <Badge
              variant="outline"
              className="rounded-full px-3 py-1 text-[11px] sm:text-xs border-primary/30 text-primary font-medium max-w-full whitespace-normal sm:whitespace-nowrap text-left"
            >
              <Sparkles className="size-3.5 shrink-0" />
              <span>Enterprise Technical Screening Platform</span>
            </Badge>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-[3.25rem] text-foreground leading-[1.15]">
              Evaluate engineering talent with{" "}
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                sandboxed coding
              </span>{" "}
              &amp; live proctoring.
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              DevAssess unifies curated Coding &amp; MCQ question banks,
              tokenized candidate invitations, automated test-suite grading, and
              anti-cheat telemetry into one streamlined hiring workspace.
            </p>

            {/* Primary Hero CTAs */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
              {isAuthenticated ? (
                <Link href={dashboardHref} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-11 gap-2 px-6 text-sm font-semibold shadow-lg shadow-primary/25 cursor-pointer">
                    <LayoutDashboard className="size-4 shrink-0" />
                    <span>Open {roleLabel} Dashboard</span>
                    <ArrowRight className="size-4 shrink-0" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto h-11 gap-2 px-6 text-sm font-semibold shadow-lg shadow-primary/25 cursor-pointer">
                      <span>Get Started</span>
                      <ArrowRight className="size-4 shrink-0" />
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto h-11 gap-2 px-5 text-sm font-semibold border-border/80 cursor-pointer"
                    >
                      <KeyRound className="size-4 shrink-0" />
                      <span>Sign In</span>
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/about" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto h-11 px-4 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  How It Works
                </Button>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-border/50 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                Node.js VM Isolated Runner
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                Hidden Test Case Grading
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                Full Audit Trail
              </span>
            </div>
          </div>

          {/* Right Live IDE Preview Card */}
          <div className="lg:col-span-5 min-w-0">
            <div className="w-full rounded-2xl border border-border/80 bg-card/85 shadow-2xl backdrop-blur-xl overflow-hidden">
              {/* IDE Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-muted/40 px-3.5 sm:px-4 py-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Terminal className="size-4 text-primary shrink-0" />
                  <span>Live Exam Arena</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  >
                    <Timer className="size-3" />
                    42:18
                  </Badge>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] border-primary/30 bg-primary/10 text-primary"
                  >
                    0 / 3 Switches
                  </Badge>
                </div>
              </div>

              {/* Code Window */}
              <div className="bg-slate-950 p-3.5 sm:p-4 font-mono text-xs text-slate-200 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                  <span>solution.js • Node.js 20</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Play className="size-3 fill-emerald-400" />
                    Sandbox Ready
                  </span>
                </div>
                <pre className="w-full max-w-full overflow-x-auto leading-relaxed text-[11px] sm:text-xs">
                  <code>
                    {`function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (seen.has(diff)) return [seen.get(diff), i];
    seen.set(nums[i], i);
  }
  return [];
}`}
                  </code>
                </pre>
              </div>

              {/* Automated Test Suite Results */}
              <div className="p-3.5 sm:p-4 space-y-2.5 bg-card/90">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-foreground">
                    Automated Grading Suite
                  </span>
                  <Badge variant="success" className="text-[10px]">
                    100% PASSED
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  {SAMPLE_TEST_CASES.map((tc) => (
                    <div
                      key={tc.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/70 px-3 py-1.5 text-xs"
                    >
                      <span className="flex items-center gap-2 font-medium text-foreground min-w-0">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{tc.name}</span>
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                        {tc.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Platform Metrics Bar */}
        <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {PLATFORM_METRICS.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5 backdrop-blur-sm space-y-1"
            >
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-primary">
                {metric.value}
              </div>
              <div className="text-sm font-bold text-foreground">
                {metric.label}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {metric.detail}
              </p>
            </div>
          ))}
        </section>

        {/* 3. Core Capabilities Grid */}
        <section className="space-y-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Platform Capabilities
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Everything required for credible technical screening
            </h2>
            <p className="text-sm text-muted-foreground">
              Purpose-built modules for authoring assessments, inviting
              developers, running live proctored tests, and auditing outcomes.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="border-border/70 bg-card/75 backdrop-blur-sm transition-all hover:border-primary/40"
                >
                  <CardHeader className="pb-3 space-y-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl ${feature.accent}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-base font-bold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 4. Role-Based Workspaces */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Role-Based Architecture
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Dedicated portals for every user role
              </h2>
            </div>
            <Link href="/about">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-semibold cursor-pointer self-start sm:self-auto"
              >
                <span>Explore Full Workflow</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WORKSPACE_ROLES.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.role}
                  className="border-border/70 bg-card/75 backdrop-blur-sm"
                >
                  <CardHeader className="pb-3 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4.5" />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {item.badge}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">
                        {item.role}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {item.tagline}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {item.points.map((point) => (
                      <div
                        key={point}
                        className="flex items-start gap-2 text-xs text-foreground/90"
                      >
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 5. Bottom CTA Banner */}
        <section className="rounded-2xl sm:rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-violet-500/10 p-5 sm:p-8 lg:p-10 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <FileCheck2 className="size-4 shrink-0" />
                <span>Ready to Launch Your Next Assessment?</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-foreground">
                Start evaluating developers or verify your account today.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Sign up as a Developer or Recruiter, or access your existing
                workspace to manage questions, invites, and candidate reviews.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
              {isAuthenticated ? (
                <Link href={dashboardHref} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-10 gap-2 px-5 text-xs font-semibold shadow-md cursor-pointer">
                    <LayoutDashboard className="size-4 shrink-0" />
                    <span>Go to {roleLabel} Dashboard</span>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto h-10 gap-2 px-5 text-xs font-semibold shadow-md cursor-pointer">
                      <Users className="size-4 shrink-0" />
                      <span>Create Account</span>
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto h-10 px-5 text-xs font-semibold bg-background/70 cursor-pointer"
                    >
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto h-10 px-4 text-xs font-semibold cursor-pointer"
                >
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
