"use client";

import * as React from "react";
import Link from "next/link";
import { useCurrentUser } from "@/app/hooks/auth.hooks";
import {
  useRecruiterProfile,
  useUpdateRecruiterProfile,
} from "@/app/hooks/user-management.hooks";
import { ChangePasswordForm } from "@/components/form/change-password-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Globe,
  KeyRound,
  Loader2,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

type SettingsTab = "company" | "security";

export default function RecruiterSettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("company");

  const { data: userData } = useCurrentUser();
  const { data: profileData, isLoading } = useRecruiterProfile();
  const updateProfileMutation = useUpdateRecruiterProfile();

  const recruiter =
    profileData?.data || (userData?.data as any)?.recruiterProfile;

  const [name, setName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [designation, setDesignation] = React.useState("");
  const [websiteUrl, setWebsiteUrl] = React.useState("");
  const [bio, setBio] = React.useState("");

  React.useEffect(() => {
    if (recruiter) {
      setName(recruiter.name || "");
      setCompanyName(recruiter.companyName || "");
      setDesignation(recruiter.designation || "");
      setWebsiteUrl(recruiter.websiteUrl || "");
      setBio(recruiter.bio || "");
    }
  }, [recruiter]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        companyName: companyName.trim(),
        designation: designation.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      toast.success("Company profile updated successfully");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/recruiter/dashboard"
              className="flex items-center gap-2"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <Building2 className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight">
                  DevAssess{" "}
                  <span className="text-primary text-xs font-semibold">
                    RECRUITER
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium -mt-1">
                  Organization Settings
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/recruiter/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-3 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Company &amp; Hiring Settings
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure your organization brand, team identity, and security
              credentials.
            </p>
          </div>

          <div className="flex rounded-xl bg-muted/60 p-1 border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab("company")}
              className={cn(
                "flex items-center gap-2 rounded-lg py-1.5 px-3.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "company"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Building2 className="size-3.5" />
              <span>Company Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={cn(
                "flex items-center gap-2 rounded-lg py-1.5 px-3.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "security"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <KeyRound className="size-3.5" />
              <span>Password &amp; Security</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Company Profile */}
        {activeTab === "company" && (
          <Card className="border-border/70 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                Organization Profile
              </CardTitle>
              <CardDescription className="text-xs">
                This information is shown to candidates on their assessment
                invites and screening scorecards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="p-12 text-center">
                  <Loader2 className="size-8 animate-spin text-primary mx-auto" />
                </div>
              ) : (
                <form
                  onSubmit={handleSaveProfile}
                  className="space-y-4 max-w-2xl"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="companyName"
                        className="text-xs font-bold"
                      >
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Technologies Ltd."
                        className="text-xs h-9 bg-background"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="recruiterName"
                        className="text-xs font-bold"
                      >
                        Hiring Manager / Recruiter Name
                      </Label>
                      <Input
                        id="recruiterName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="text-xs h-9 bg-background"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="designation"
                        className="text-xs font-bold"
                      >
                        Your Designation
                      </Label>
                      <Input
                        id="designation"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Lead Technical Recruiter"
                        className="text-xs h-9 bg-background"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="websiteUrl" className="text-xs font-bold">
                        Company Website URL
                      </Label>
                      <Input
                        id="websiteUrl"
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://company.com"
                        className="text-xs h-9 bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bio" className="text-xs font-bold">
                      About Organization / Engineering Culture
                    </Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Briefly describe what your engineering team builds..."
                      rows={3}
                      className="text-xs bg-background resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="h-9 gap-1.5 text-xs font-bold cursor-pointer"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Save className="size-3.5" />
                      )}
                      <span>Save Company Profile</span>
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === "security" && (
          <div className="max-w-2xl">
            <ChangePasswordForm />
          </div>
        )}
      </main>
    </div>
  );
}
