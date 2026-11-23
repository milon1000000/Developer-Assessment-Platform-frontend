"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser, useLogout } from "@/app/hooks/auth.hooks";
import { AuthShell } from "@/components/auth/auth-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Code2,
  LayoutDashboard,
  Loader2,
  LogOut,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();
  const { data: currentUserData, isLoading: isUserLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  const rawUser = currentUserData?.data as {
    user?: {
      email?: string;
      role?: string;
      name?: string;
      developerProfile?: { name?: string };
      recruiterProfile?: { name?: string; companyName?: string };
      adminProfile?: { name?: string };
    };
    profile?: { name?: string; companyName?: string };
    adminProfile?: { name?: string };
    recruiterProfile?: { name?: string; companyName?: string };
    developerProfile?: { name?: string };
    role?: string;
    email?: string;
    name?: string;
  } | null;

  const profile = rawUser?.profile;
  const user = rawUser?.user || rawUser;
  const isAuthenticated = !isUserLoading && !!(user?.email || rawUser?.email);
  const role = user?.role || rawUser?.role;
  const userEmail = user?.email || rawUser?.email || "";

  const userName =
    profile?.name ||
    user?.adminProfile?.name ||
    user?.recruiterProfile?.name ||
    user?.developerProfile?.name ||
    rawUser?.adminProfile?.name ||
    rawUser?.recruiterProfile?.name ||
    rawUser?.developerProfile?.name ||
    rawUser?.name ||
    user?.email?.split("@")[0] ||
    "User";

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

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const title = isAuthenticated
    ? `Welcome Back, ${userName}`
    : "Developer Assessment Gateway";

  const subtitle = isAuthenticated
    ? "You have an active session. Proceed directly to your workspace dashboard."
    : "Select an option below to enter the platform or take a test";

  const badgeText = isAuthenticated
    ? "Active Session"
    : "Automated Technical Screening";

  return (
    <AuthShell title={title} subtitle={subtitle} badgeText={badgeText}>
      {isUserLoading ? (
        <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              Verifying active session...
            </p>
          </CardContent>
        </Card>
      ) : isAuthenticated ? (
        /* Logged In View - Replaces "Sign in / Create Account" */
        <Card className="border-border/70 bg-card/85 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

          <CardHeader className="space-y-1.5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <span>Active Workspace</span>
              </CardTitle>
              <Badge
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5",
                  role === "ADMIN"
                    ? "bg-violet-600/20 text-violet-400 border border-violet-500/30"
                    : role === "RECRUITER"
                      ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30",
                )}
              >
                {roleLabel}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Signed in as{" "}
              <span className="font-semibold text-foreground">{userName}</span>{" "}
              <span className="text-muted-foreground">({userEmail})</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3.5">
            {/* Primary Dashboard Navigation Button */}
            <Link href={dashboardHref} className="block">
              <Button className="w-full h-12 font-bold text-sm shadow-lg shadow-primary/25 flex items-center justify-between px-4 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer transition-all hover:scale-[1.01]">
                <span className="flex items-center gap-2.5">
                  <LayoutDashboard className="size-4.5" />
                  <span>Go to {roleLabel} Dashboard</span>
                </span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            {/* Role Quick Links */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {role === "ADMIN" && (
                <>
                  <Link href="/admin/questions">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold border-border/80 hover:bg-muted justify-center cursor-pointer"
                    >
                      Question Bank
                    </Button>
                  </Link>
                  <Link href="/admin/assessments">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold border-border/80 hover:bg-muted justify-center cursor-pointer"
                    >
                      Assessments
                    </Button>
                  </Link>
                </>
              )}

              {role === "RECRUITER" && (
                <>
                  <Link href="/recruiter/assessments">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold border-border/80 hover:bg-muted justify-center cursor-pointer"
                    >
                      Assessments
                    </Button>
                  </Link>
                  <Link href="/recruiter/invites">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold border-border/80 hover:bg-muted justify-center cursor-pointer"
                    >
                      Candidate Invites
                    </Button>
                  </Link>
                </>
              )}

              {role === "DEVELOPER" && (
                <>
                  <Link href="/candidate/dashboard">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold border-border/80 hover:bg-muted justify-center cursor-pointer"
                    >
                      Workspace
                    </Button>
                  </Link>
                  <Link href="/candidate/settings">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold border-border/80 hover:bg-muted justify-center cursor-pointer"
                    >
                      Settings
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Logout / Switch Account */}
            <div className="pt-2 border-t border-border/60">
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full h-9 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <LogOut className="size-3.5" />
                )}
                <span>Sign Out / Switch Account</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Unauthenticated View - Original Get Started with Sign In / Register */
        <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">Get Started</CardTitle>
            <CardDescription className="text-xs">
              Access your developer assessment environment or recruit talent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <Link href="/login" className="block">
              <Button className="w-full h-11 font-semibold text-sm shadow-md shadow-primary/20 flex items-center justify-between px-4 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Code2 className="size-4" />
                  Sign In to Platform
                </span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            <Link href="/register" className="block">
              <Button
                variant="outline"
                className="w-full h-11 font-semibold text-sm border-border/80 hover:bg-muted flex items-center justify-between px-4 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Users className="size-4" />
                  Create New Account
                </span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </AuthShell>
  );
}
