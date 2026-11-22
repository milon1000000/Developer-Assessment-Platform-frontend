"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser, useLogout } from "@/app/hooks/auth.hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  ShieldAlert,
  Users,
  LogOut,
  Activity,
  Server,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: userData, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  const rawData = userData?.data as {
    user?: {
      email?: string;
      role?: string;
      adminProfile?: {
        name?: string;
      };
    };
    profile?: {
      name?: string;
    };
    email?: string;
    adminProfile?: {
      name?: string;
    };
  } | null;

  const user = rawData?.user || rawData;
  const admin = rawData?.profile || user?.adminProfile;

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
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <ShieldAlert className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight">
                  DevAssess{" "}
                  <span className="text-primary text-xs font-semibold">
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
        <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-card/90 via-card/70 to-card/90 p-6 shadow-xl backdrop-blur-md">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Developers, Recruiters & Admins
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Active Code Runners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-[11px] text-emerald-500 font-medium mt-1">
                All Sandboxes Healthy
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">Normal</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Latency: 28ms
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
