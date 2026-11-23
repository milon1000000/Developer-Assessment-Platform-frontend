import * as React from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background w-full">
      <DashboardSidebar role="RECRUITER" />
      <main className="flex-1 min-w-0 w-full overflow-y-auto">
        <div className="mx-auto max-w-7xl p-3 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
