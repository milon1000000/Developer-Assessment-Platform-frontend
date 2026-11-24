"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/app/hooks/auth.hooks";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: userData, isLoading } = useCurrentUser();

  const user = (userData?.data as any)?.user || (userData?.data as any);
  const role = user?.role;

  React.useEffect(() => {
    if (!isLoading) {
      if (!user || !role) {
        router.replace("/login?redirect=/admin/dashboard");
      } else if (role !== "ADMIN") {
        if (role === "RECRUITER") {
          router.replace("/recruiter/dashboard");
        } else {
          router.replace("/candidate/dashboard");
        }
      }
    }
  }, [isLoading, user, role, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">
            Verifying administrative access...
          </p>
        </div>
      </div>
    );
  }

  if (!user || role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background w-full">
      <DashboardSidebar role="ADMIN" />
      <main className="flex-1 min-w-0 w-full overflow-y-auto">
        <div className="mx-auto max-w-7xl p-3 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
