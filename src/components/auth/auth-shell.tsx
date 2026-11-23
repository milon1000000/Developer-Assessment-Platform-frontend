"use client";

import {
  CheckCircle2,
  Code2,
  Cpu,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { toast } from "sonner";
import { useCurrentUser, useLogout } from "@/app/hooks/auth.hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  badgeText?: string;
}

export function AuthShell({
  children,
  title,
  subtitle,
  badgeText = "Enterprise Assessment Platform",
}: AuthShellProps) {
  const router = useRouter();
  const { data: currentUserData, isLoading: isUserLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  const rawUser = currentUserData?.data as {
    user?: {
      email?: string;
      role?: string;
      name?: string;
      developerProfile?: { name?: string };
      recruiterProfile?: { name?: string };
      adminProfile?: { name?: string };
    };
    profile?: { name?: string };
    adminProfile?: { name?: string };
    recruiterProfile?: { name?: string };
    developerProfile?: { name?: string };
    role?: string;
    email?: string;
    name?: string;
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

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully", {
        description: "You have been signed out of your account.",
      });
      router.push("/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Background Ambient Glows & Grid Pattern */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[130px] dark:bg-primary/15" />
        <div className="absolute top-1/2 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[150px] dark:bg-indigo-500/15" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[140px] dark:bg-violet-600/10" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
              <Code2 className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
                DevAssess
                <span className="rounded-sm bg-primary/15 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium -mt-1">
                Developer Assessment Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Badge
              variant="brand"
              className="hidden sm:inline-flex py-1 px-3 gap-1.5"
            >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Anti-Cheat Engine Active
            </Badge>

            {/* Dark / Light Mode Switcher */}
            <ThemeToggle />

            {/* Login / Dashboard & Logout Toggle Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href={dashboardHref}>
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 px-3 text-xs font-semibold shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer transition-all hover:scale-[1.02]"
                    title="Go to Dashboard"
                  >
                    <LayoutDashboard className="size-3.5" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="h-8 gap-1.5 px-3 text-xs font-semibold border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer"
                  title="Log out from DevAssess"
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <LogOut className="size-3.5" />
                  )}
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="h-8 gap-1.5 px-3 text-xs font-semibold shadow-xs cursor-pointer"
                  title="Sign in to your account"
                >
                  <LogIn className="size-3.5" />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Auth Split Container */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-12">
          {/* Left Feature Showcase Banner (Desktop Only) */}
          <div className="hidden lg:col-span-5 lg:flex lg:flex-col justify-center space-y-8 pr-4">
            <div className="space-y-4">
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 text-xs border-primary/30 text-primary font-medium inline-flex items-center gap-1.5"
              >
                <Sparkles className="size-3.5" />
                {badgeText}
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground leading-[1.15]">
                Evaluate tech talent with{" "}
                <span className="bg-gradient-to-r from-primary via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                  real-world coding
                </span>{" "}
                sandboxes.
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Run automated test cases, live proctored screening, and
                AI-assisted code analysis in isolated micro-containers.
              </p>
            </div>

            {/* Feature List Cards */}
            <div className="space-y-3.5">
              <div className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card/90">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Terminal className="size-4.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-foreground">
                    Sandboxed Code Runner
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    High-performance execution engine supporting 30+ languages
                    with memory and time caps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card/90">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-4.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-foreground">
                    Intelligent Anti-Cheat
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Tab blur tracking, copy-paste telemetry, and automated
                    proctoring alerts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card/90">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Cpu className="size-4.5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-foreground">
                    Automated Test Suite Grading
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Instant pass/fail metrics, hidden testcases verification,
                    and runtime analysis.
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="flex items-center gap-6 pt-2 border-t border-border/40 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>99.98% Uptime SLA</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>Enterprise Grade Security</span>
              </div>
            </div>
          </div>

          {/* Right Form Container */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-4">
              <div className="text-center lg:text-left space-y-1 mb-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {title}
                </h2>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full border-t border-border/40 bg-background/50 py-4 text-center text-xs text-muted-foreground backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} DevAssess Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:underline hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:underline hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="hover:underline hover:text-foreground">
              Security
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
