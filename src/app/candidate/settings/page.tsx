import type { Metadata } from "next";
import Link from "next/link";
import { ProfileSettingsForm } from "@/components/form/profile-settings-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Code2, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Profile Settings | DevAssess Candidate Portal",
  description:
    "Update your developer credentials, skills, portfolio links, and avatar.",
};

export default function CandidateSettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/candidate/dashboard"
              className="flex items-center gap-2"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <Code2 className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight">
                  DevAssess{" "}
                  <span className="text-primary text-xs font-semibold">
                    SETTINGS
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium -mt-1">
                  Developer Profile Management
                </span>
              </div>
            </Link>
            <Badge
              variant="brand"
              className="hidden md:inline-flex text-[10px] py-0.5 px-2"
            >
              <ShieldCheck className="size-3 mr-1 text-emerald-500" />
              Secure TLS 1.3
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/candidate/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-3 text-xs font-semibold"
              >
                <ArrowLeft className="size-3.5" />
                <span>Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Settings Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Developer Profile & Workspace
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your personal details, skill set, online portfolios, and
            resume for technical evaluations.
          </p>
        </div>

        <ProfileSettingsForm />
      </main>
    </div>
  );
}
