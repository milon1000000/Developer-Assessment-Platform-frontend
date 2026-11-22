"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProfileSettingsForm } from "@/components/form/profile-settings-form";
import { ChangePasswordForm } from "@/components/form/change-password-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  ShieldCheck,
  ArrowLeft,
  User,
  KeyRound,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "security";

function CandidateSettingsContent() {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "security" ? "security" : "profile";
  const [activeTab, setActiveTab] = React.useState<SettingsTab>(initialTab);

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Account & Security Settings
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your personal profile, tech stack, and authentication
            credentials
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex rounded-xl bg-muted/70 p-1 border border-border/60 w-full sm:w-auto self-start">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-1.5 px-3.5 text-xs font-semibold transition-all cursor-pointer",
              activeTab === "profile"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <User className="size-3.5" />
            Profile & Workspace
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-1.5 px-3.5 text-xs font-semibold transition-all cursor-pointer",
              activeTab === "security"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <KeyRound className="size-3.5" />
            Password & Security
          </button>
        </div>
      </div>

      {/* Render Active Tab Form */}
      {activeTab === "profile" ? (
        <ProfileSettingsForm />
      ) : (
        <div className="max-w-2xl mx-auto">
          <ChangePasswordForm />
        </div>
      )}
    </div>
  );
}

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
                  Developer Workspace
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
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="flex h-64 w-full items-center justify-center">
              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }
        >
          <CandidateSettingsContent />
        </Suspense>
      </main>
    </div>
  );
}
