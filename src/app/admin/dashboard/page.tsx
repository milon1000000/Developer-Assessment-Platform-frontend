"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser, useLogout } from "@/app/hooks/auth.hooks";
import { useAdminDashboard } from "@/app/hooks/dashboard.hooks";
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
  ShieldAlert,
  Users,
  LogOut,
  Activity,
  Server,
  Loader2,
  FileCheck2,
  Code2,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

function getInitials(name?: string) {
  if (!name) return "A";
  const clean = name.replace(/[^\w\s]/gi, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: userData, isLoading: isUserLoading } = useCurrentUser();
  const { data: dashboardData, isLoading: isDashboardLoading } =
    useAdminDashboard();
  const logoutMutation = useLogout();

  const rawData = userData?.data as {
    user?: {
      email?: string;
      role?: string;
      adminProfile?: {
        name?: string;
        avatarUrl?: string;
      };
    };
    profile?: {
      name?: string;
      avatarUrl?: string;
    };
    email?: string;
    adminProfile?: {
      name?: string;
      avatarUrl?: string;
    };
  } | null;

  const user = rawData?.user || rawData;
  const admin = rawData?.profile || user?.adminProfile;
  const counts = dashboardData?.data?.counts;
  const recent = dashboardData?.data?.recentActivity;

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
            Loading admin control center...
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
              <div className="flex size-9 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-md shadow-destructive/20">
                <ShieldAlert className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight">
                  DevAssess{" "}
                  <span className="text-destructive text-xs font-semibold">
                    ADMIN
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium -mt-1">
                  System Control Center
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
        {/* Admin Header Banner */}
        <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-card/90 via-card/70 to-card/90 p-6 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive shadow-sm">
              <AvatarImage
                src={admin?.avatarUrl || undefined}
                alt={admin?.name || "Admin"}
                className="size-14 rounded-2xl object-cover"
              />
              <AvatarFallback className="size-14 rounded-2xl bg-destructive/15 text-destructive text-base font-bold uppercase tracking-wider">
                {getInitials(admin?.name || user?.email || "A")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  Platform Administration
                </h1>
                <Badge className="bg-destructive/15 text-destructive border-destructive/25 text-[10px] py-0 px-2 font-semibold">
                  Super Admin
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Logged in as {admin?.name || user?.email} ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/users">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold gap-1.5"
              >
                <Users className="size-3.5" />
                <span>User Directory</span>
              </Button>
            </Link>
            <Link href="/admin/audit-logs">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold gap-1.5"
              >
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>Security Audit</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Total Users
              </CardTitle>
              <Users className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {counts?.totalUsers ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {counts?.totalDevelopers ?? 0} Devs •{" "}
                {counts?.totalRecruiters ?? 0} Recruiters
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Assessments
              </CardTitle>
              <FileCheck2 className="size-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {counts?.totalAssessments ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {counts?.totalQuestions ?? 0} Global Questions
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
                {counts?.totalSubmissions ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {counts?.completedSubmissions ?? 0} Completed (
                {counts?.overallPassRate ?? 0}% Pass Rate)
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Sandbox Health
              </CardTitle>
              <Server className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                100% Online
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                0 Active Violations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions & Assessments Dual Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Candidate Submissions */}
          <Card className="border-border/70 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">
                  Recent Submissions
                </CardTitle>
                <CardDescription className="text-xs">
                  Latest exams taken across platform
                </CardDescription>
              </div>
              <Link
                href="/admin/submissions"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recent?.recentSubmissions &&
              recent.recentSubmissions.length > 0 ? (
                <div className="divide-y divide-border/50 space-y-2">
                  {recent.recentSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="pt-2 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground">
                          {sub.developer?.name ||
                            sub.developer?.user?.email ||
                            "Candidate"}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {sub.assessment?.title || "Assessment"}
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <Badge
                          variant="outline"
                          className={
                            sub.isPassed
                              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px]"
                              : "border-rose-500/40 text-rose-400 bg-rose-500/10 text-[10px]"
                          }
                        >
                          {sub.percentage}% {sub.isPassed ? "PASS" : "FAIL"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No recent submissions recorded.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Platform Registered Users */}
          <Card className="border-border/70 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">
                  Recent Users
                </CardTitle>
                <CardDescription className="text-xs">
                  Latest platform member registrations
                </CardDescription>
              </div>
              <Link
                href="/admin/users"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Manage Users <ArrowRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recent?.recentUsers && recent.recentUsers.length > 0 ? (
                <div className="divide-y divide-border/50 space-y-2">
                  {recent.recentUsers.map((u) => (
                    <div
                      key={u.id}
                      className="pt-2 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-foreground">
                          {u.email}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] uppercase font-mono"
                      >
                        {u.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No user registrations found.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
