"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser, useLogout } from "@/app/hooks/auth.hooks";
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
  const logoutMutation = useLogout();

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <Code2 className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight">
                  DevAssess{" "}
                  <span className="text-primary text-xs font-semibold">
                    CANDIDATE
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium -mt-1">
                  Developer Workspace
                </span>
              </div>
            </Link>
            <Badge
              variant="brand"
              className="hidden md:inline-flex text-[10px] py-0.5 px-2"
            >
              <ShieldCheck className="size-3 mr-1 text-emerald-500" />
              Anti-Cheat Active
            </Badge>
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Welcome Banner */}
        <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-card/90 via-card/70 to-card/90 p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <Avatar className="size-14 rounded-2xl border border-primary/25 bg-primary/10 text-primary shadow-sm">
                <AvatarImage
                  src={developer?.avatarUrl || undefined}
                  alt={developer?.name || "Developer"}
                  className="size-14 rounded-2xl object-cover"
                />
                <AvatarFallback className="size-14 rounded-2xl bg-primary/15 text-primary text-base font-bold uppercase tracking-wider">
                  {getInitials(developer?.name || user?.email || "D")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">
                    Welcome back, {developer?.name || "Developer"}
                  </h1>
                  <Badge className="bg-primary/15 text-primary border-primary/25 text-[10px] py-0 px-2 font-semibold">
                    Developer Verified
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
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
              <div className="text-2xl font-bold">2</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                1 Pending • 1 Completed
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
              <div className="text-2xl font-bold">92%</div>
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
              <div className="text-2xl font-bold">5</div>
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
            <h2 className="text-lg font-bold tracking-tight">
              Active Assessments
            </h2>
            <span className="text-xs text-muted-foreground">
              Updated in real-time
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Full Stack React & Node Assessment
                </CardTitle>
                <CardDescription className="text-xs">
                  Sandbox test covering Next.js App Router, PostgreSQL schemas,
                  and REST APIs.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    3 Coding Questions
                  </span>
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-semibold"
                  >
                    <Play className="size-3.5 fill-current" />
                    Enter Sandbox
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                    Score: 95/100
                  </span>
                </div>
                <CardTitle className="text-base font-bold mt-2">
                  Algorithms & Problem Solving
                </CardTitle>
                <CardDescription className="text-xs">
                  Complexity analysis, dynamic programming, and data structures.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    Submitted 2 days ago
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold"
                  >
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
