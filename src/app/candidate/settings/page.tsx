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
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="flex h-64 w-full items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <CandidateSettingsContent />
      </Suspense>
    </div>
  );
}
