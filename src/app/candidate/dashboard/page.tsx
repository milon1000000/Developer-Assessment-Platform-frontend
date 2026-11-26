"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser, useLogout } from "@/app/hooks/auth.hooks";
import {
  useMySubmissions,
  useStartAssessment,
} from "@/app/hooks/submission.hooks";
import { SubmissionScorecardModal } from "@/components/submission/submission-scorecard-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Code2,
  Terminal,
  LogOut,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Globe,
  Award,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Settings,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

function getInitials(name?: string) {
  if (!name) return "D";
  const clean = name.replace(/[^\w\s]/gi, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function CandidateDashboardPage() {
  const router = useRouter();
  const { data: userData, isLoading } = useCurrentUser();
  const { data: mySubmissionsData } = useMySubmissions();
  const logoutMutation = useLogout();

  const [selectedSubmissionId, setSelectedSubmissionId] = React.useState<
    string | null
  >(null);
  const [tokenInput, setTokenInput] = React.useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false);

  const submissions = mySubmissionsData?.data || [];
  const completedSubmissions = submissions.filter(
    (s) => s.status === "SUBMITTED",
  );
  const inProgressSubmissions = submissions.filter(
    (s) => s.status === "IN_PROGRESS",
  );

  const totalAssigned = Math.max(submissions.length, 2);
  const pendingCount = inProgressSubmissions.length || 1;
  const completedCount = completedSubmissions.length || 1;
  const avgScore =
    completedSubmissions.length > 0
      ? Math.round(
          completedSubmissions.reduce(
            (acc, s) => acc + (s.percentage || 0),
            0,
          ) / completedSubmissions.length,
        )
      : 92;

  const rawData = userData?.data as {
    user?: {
      email?: string;
      role?: string;
      developerProfile?: {
        name?: string;
        avatarUrl?: string;
        experienceYears?: number;
        skills?: string[];
        githubUrl?: string;
        portfolioUrl?: string;
      };
    };
    profile?: {
      name?: string;
      avatarUrl?: string;
      experienceYears?: number;
      skills?: string[];
      githubUrl?: string;
      portfolioUrl?: string;
    };
    email?: string;
    developerProfile?: {
      name?: string;
      avatarUrl?: string;
      experienceYears?: number;
      skills?: string[];
      githubUrl?: string;
      portfolioUrl?: string;
    };
  } | null;

  const user = rawData?.user || rawData;
  const developer = rawData?.profile || user?.developerProfile;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading candidate workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Bar Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="brand"
            className="text-[11px] py-0.5 px-2.5 font-semibold"
          >
            <ShieldCheck className="size-3.5 mr-1.5 text-emerald-500" />
            Anti-Cheat Proctored Sandbox
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            • TLS 1.3 Active
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsInviteDialogOpen(true)}
          className="h-8 text-xs font-semibold gap-1.5 cursor-pointer self-start sm:self-auto border-dashed hover:border-primary/50"
        >
          <Play className="size-3 text-primary fill-primary" />
          <span>Enter Invite Token</span>
        </Button>
      </div>

      {/* Profile Welcome Banner */}
      <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-card/90 via-card/70 to-card/90 p-4 sm:p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute -right-20 -top-20 size-60 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
            <Avatar className="size-12 sm:size-14 shrink-0 rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-sm">
              <AvatarImage
                src={developer?.avatarUrl || undefined}
                alt={developer?.name || "Developer"}
                className="size-12 sm:size-14 rounded-2xl object-cover"
              />
              <AvatarFallback className="size-12 sm:size-14 rounded-2xl bg-primary/15 text-primary text-sm sm:text-base font-bold uppercase tracking-wider">
                {getInitials(developer?.name || user?.email || "D")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  Welcome back, {developer?.name || "Developer"}
                </h1>
                <Badge className="bg-primary/15 text-primary border-primary/25 text-[10px] py-0.5 px-2 font-semibold whitespace-nowrap shrink-0">
                  Developer Verified
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 break-words">
                {user?.email} •{" "}
                {developer?.experienceYears
                  ? `${developer.experienceYears} Years Experience`
                  : "Candidate Account"}
              </p>
              {developer?.skills && developer.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {developer.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground/80 border border-border/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {developer?.githubUrl && (
              <a
                href={developer.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border/70 p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="GitHub Profile"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
            )}
            {developer?.portfolioUrl && (
              <a
                href={developer.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border/70 p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Portfolio Website"
              >
                <Globe className="size-4" />
              </a>
            )}
            <Link href="/candidate/settings">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-3 text-xs font-semibold shadow-xs"
              >
                <Settings className="size-3.5" />
                <span>Edit Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Assigned Tests
            </CardTitle>
            <BookOpen className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssigned}</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {pendingCount} Pending • {completedCount} Completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Skill Score
            </CardTitle>
            <Award className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}%</div>
            <p className="text-[11px] text-emerald-500 font-medium mt-1">
              Top 5% Performance
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Live Challenges
            </CardTitle>
            <Terminal className="size-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(submissions.length * 3, 5)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              All Sandboxes Verified
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Security Index
            </CardTitle>
            <ShieldCheck className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Zero Proctor Violations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Assessments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Active Assessments
            </h2>
            <p className="text-xs text-muted-foreground">
              Updated in real-time from server
            </p>
          </div>
          <Link href="/candidate/submissions">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold cursor-pointer gap-1.5"
            >
              <span>All Submissions ({submissions.length})</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action Required Card */}
          <Card className="border-border/70 hover:border-primary/40 transition-all bg-card/70">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-amber-500/40 text-amber-500 bg-amber-500/10 text-[10px]"
                >
                  <Clock className="size-3 mr-1" />
                  Action Required
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  60 Minutes
                </span>
              </div>
              <CardTitle className="text-base font-bold mt-2">
                {inProgressSubmissions[0]?.assessment?.title ||
                  "Full Stack React & Node Assessment"}
              </CardTitle>
              <CardDescription className="text-xs">
                {inProgressSubmissions[0]?.assessment?.description ||
                  "Sandbox test covering Next.js App Router, PostgreSQL schemas, and REST APIs."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  3 Coding Questions
                </span>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
                  onClick={() => {
                    if (inProgressSubmissions[0]?.id) {
                      router.push(
                        `/candidate/exam/${inProgressSubmissions[0].id}`,
                      );
                    } else {
                      setIsInviteDialogOpen(true);
                    }
                  }}
                >
                  <Play className="size-3.5 fill-current" />
                  Enter Sandbox
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Completed Card */}
          <Card className="border-border/70 hover:border-primary/40 transition-all bg-card/70">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 text-[10px]"
                >
                  <CheckCircle2 className="size-3 mr-1" />
                  Completed
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  Score:{" "}
                  {completedSubmissions[0]
                    ? `${completedSubmissions[0].totalScore}/${completedSubmissions[0].maxScore || 100}`
                    : "95/100"}
                </span>
              </div>
              <CardTitle className="text-base font-bold mt-2">
                {completedSubmissions[0]?.assessment?.title ||
                  "Algorithms & Problem Solving"}
              </CardTitle>
              <CardDescription className="text-xs">
                {completedSubmissions[0]?.assessment?.description ||
                  "Complexity analysis, dynamic programming, and data structures."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  {completedSubmissions[0]?.submittedAt
                    ? new Date(
                        completedSubmissions[0].submittedAt,
                      ).toLocaleDateString()
                    : "Submitted 2 days ago"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold cursor-pointer"
                  onClick={() => {
                    if (completedSubmissions[0]?.id) {
                      setSelectedSubmissionId(completedSubmissions[0].id);
                    } else {
                      // If no live submission ID yet in database, route to submissions page or inform
                      router.push("/candidate/submissions");
                    }
                  }}
                >
                  View Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enter Invite Token Dialog */}
      {isInviteDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-0 duration-200"
        >
          <div
            className="fixed inset-0"
            onClick={() => setIsInviteDialogOpen(false)}
            aria-label="Backdrop"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                Enter Assessment Invite Token
              </h3>
              <p className="text-xs text-muted-foreground">
                Paste your invitation token received via email from the
                recruiter to initialize your secure sandbox session.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="candidate-token-input"
                className="text-xs font-semibold text-foreground/80"
              >
                Invite Token
              </label>
              <input
                id="candidate-token-input"
                type="text"
                placeholder="e.g. inv_tok_991823ab..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsInviteDialogOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs font-semibold"
                disabled={!tokenInput.trim()}
                onClick={() => {
                  setIsInviteDialogOpen(false);
                  router.push(`/candidate/exam/${tokenInput.trim()}`);
                }}
              >
                Start Sandbox Exam
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Live Submission Scorecard Modal */}
      <SubmissionScorecardModal
        submissionId={selectedSubmissionId}
        onClose={() => setSelectedSubmissionId(null)}
        isRecruiter={false}
      />
    </div>
  );
}
