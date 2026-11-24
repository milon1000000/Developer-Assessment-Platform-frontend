"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser, useLogout } from "@/app/hooks/auth.hooks";
import { useRecruiterDashboard } from "@/app/hooks/dashboard.hooks";
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
  Building2,
  Users,
  LogOut,
  PlusCircle,
  FileText,
  Search,
  Sparkles,
  Loader2,
  GraduationCap,
  Mail,
  FileCheck2,
  Award,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

function getInitials(name?: string) {
  if (!name) return "R";
  const clean = name.replace(/[^\w\s]/gi, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const { data: userData, isLoading: isUserLoading } = useCurrentUser();
  const { data: dashboardData, isLoading: isDashboardLoading } =
    useRecruiterDashboard();
  const logoutMutation = useLogout();

  const rawData = userData?.data as {
    user?: {
      email?: string;
      role?: string;
      recruiterProfile?: {
        name?: string;
        companyName?: string;
        designation?: string;
        avatarUrl?: string;
      };
    };
    profile?: {
      name?: string;
      companyName?: string;
      designation?: string;
      avatarUrl?: string;
    };
    email?: string;
    recruiterProfile?: {
      name?: string;
      companyName?: string;
      designation?: string;
      avatarUrl?: string;
    };
  } | null;

  const user = rawData?.user || rawData;
  const recruiter = rawData?.profile || user?.recruiterProfile;
  const counts = dashboardData?.data?.counts;
  const recentSubmissions = dashboardData?.data?.recentSubmissions || [];
  const topAssessments = dashboardData?.data?.topAssessments || [];

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  if (isUserLoading || isDashboardLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">
            Loading recruiter portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <Building2 className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight">
                  DevAssess{" "}
                  <span className="text-primary text-xs font-semibold">
                    RECRUITER
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium -mt-1">
                  Talent Acquisition Portal
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="h-8 gap-1.5 px-3 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              <LogOut className="size-3.5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Recruiter Banner */}
        <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-card/90 via-card/70 to-card/90 p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-14 rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-sm">
                <AvatarImage
                  src={recruiter?.avatarUrl || undefined}
                  alt={recruiter?.name || "Recruiter"}
                  className="size-14 rounded-2xl object-cover"
                />
                <AvatarFallback className="size-14 rounded-2xl bg-primary/15 text-primary text-base font-bold uppercase tracking-wider">
                  {getInitials(recruiter?.name || user?.email || "R")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">
                    {recruiter?.companyName || "Company"} Talent Portal
                  </h1>
                  <Badge className="bg-primary/15 text-primary border-primary/25 text-[10px] py-0 px-2 font-semibold">
                    Recruiter Verified
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {recruiter?.name} ({user?.email}) •{" "}
                  {recruiter?.designation || "Hiring Manager"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/recruiter/invites">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs h-9"
                >
                  <Mail className="size-3.5" />
                  Invite Candidates
                </Button>
              </Link>
              <Link href="/recruiter/assessments">
                <Button size="sm" className="gap-1.5 text-xs h-9">
                  <PlusCircle className="size-3.5" />
                  Manage Assessments
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Active Assessments
              </CardTitle>
              <FileCheck2 className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {counts?.activeAssessments ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {counts?.totalAssessments ?? 0} Total Created
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Candidates Invited
              </CardTitle>
              <Mail className="size-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {counts?.totalInvites ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {counts?.acceptedInvites ?? 0} Accepted (
                {counts?.pendingInvites ?? 0} Pending)
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Submissions
              </CardTitle>
              <GraduationCap className="size-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {counts?.completedSubmissions ?? 0}
              </div>
              <p className="text-[11px] text-emerald-500 font-medium mt-1">
                {counts?.passedCandidates ?? 0} Passed ({counts?.passRate ?? 0}%
                Pass Rate)
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Avg. Candidate Score
              </CardTitle>
              <Award className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {counts?.averageScore ?? 0}%
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Across all candidate tests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dual Cards: Recent Candidate Submissions & Top Assessments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Candidate Submissions */}
          <Card className="border-border/70 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">
                  Candidate Submissions
                </CardTitle>
                <CardDescription className="text-xs">
                  Latest submissions ready for recruiter evaluation
                </CardDescription>
              </div>
              <Link
                href="/recruiter/submissions"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Review all <ArrowRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentSubmissions.length > 0 ? (
                <div className="divide-y divide-border/50 space-y-2">
                  {recentSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="pt-2 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-foreground">
                          {sub.developer?.name ||
                            sub.developer?.user?.email ||
                            "Candidate"}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {sub.assessment?.title || "Assessment"}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            sub.isPassed
                              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px]"
                              : "border-rose-500/40 text-rose-400 bg-rose-500/10 text-[10px]"
                          }
                        >
                          {sub.percentage}% {sub.isPassed ? "PASSED" : "FAILED"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No candidate submissions yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Active Assessments Performance */}
          <Card className="border-border/70 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">
                  Top Assessments
                </CardTitle>
                <CardDescription className="text-xs">
                  Highest activity screening benchmarks
                </CardDescription>
              </div>
              <Link
                href="/recruiter/assessments"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                All Assessments <ArrowRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {topAssessments.length > 0 ? (
                <div className="divide-y divide-border/50 space-y-2">
                  {topAssessments.map((ass) => (
                    <div
                      key={ass.id}
                      className="pt-2 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-foreground">
                          {ass.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {ass.durationMinutes} Mins • Passing{" "}
                          {ass.passingScore}%
                        </div>
                      </div>
                      <div className="text-right text-[11px] font-mono text-muted-foreground">
                        {ass._count?.submissions || 0} Submissions
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No active assessments found.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
