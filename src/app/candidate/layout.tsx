"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/app/hooks/auth.hooks";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Loader2 } from "lucide-react";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: userData, isLoading } = useCurrentUser();

  const user = (userData?.data as any)?.user || (userData?.data as any);
  const role = user?.role;

  // When inside a live timed exam or IDE assessment session, grant full screen without sidebar
  const isExamScreen =
    pathname?.includes("/candidate/exam/") ||
    pathname?.includes("/candidate/assessment/");

  React.useEffect(() => {
    if (!isExamScreen && !isLoading) {
      if (!user || !role) {
        router.replace(
          `/login?redirect=${encodeURIComponent(pathname || "/candidate/dashboard")}`,
        );
      } else if (role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else if (role === "RECRUITER") {
        router.replace("/recruiter/dashboard");
      }
    }
  }, [isExamScreen, isLoading, user, role, router, pathname]);

  if (isExamScreen) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-medium">
            Verifying candidate workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!user || role !== "DEVELOPER") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background w-full">
      <DashboardSidebar role="DEVELOPER" />
      <main className="flex-1 min-w-0 w-full overflow-y-auto">
        <div className="mx-auto max-w-7xl p-3 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
