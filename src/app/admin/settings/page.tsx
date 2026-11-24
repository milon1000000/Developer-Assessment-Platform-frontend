"use client";

import * as React from "react";
import { useCurrentUser } from "@/app/hooks/auth.hooks";
import {
  useAdminProfile,
  useUpdateAdminProfile,
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
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  Save,
  Shield,
  ShieldAlert,
  User,
} from "lucide-react";
import { toast } from "sonner";

type SettingsTab = "profile" | "security";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile");

  const { data: userData } = useCurrentUser();
  const { data: profileData, isLoading } = useAdminProfile();
  const updateProfileMutation = useUpdateAdminProfile();

  const admin = profileData?.data || (userData?.data as any)?.adminProfile;

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  React.useEffect(() => {
    if (admin) {
      setName(admin.name || "");
      setPhone(admin.phone || "");
    }
  }, [admin]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      toast.success("Admin profile updated successfully");
    } catch (err: any) {
      const msg =
        err?.response?._data?.message ||
        err?.message ||
        "Failed to update profile";
      toast.error(msg);
    }
  };

  const email =
    (userData?.data as any)?.user?.email ||
    (userData?.data as any)?.email ||
    "admin@devassess.io";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-500">
                <ShieldAlert className="size-4" />
              </span>
              <span>System & Admin Settings</span>
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-violet-500/30 text-violet-500 bg-violet-500/10"
            >
              Super Admin
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage administrative credentials, platform security parameters, and
            profile details.
          </p>
        </div>

        {/* Tab Buttons */}
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
            Admin Profile
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
            Security & Password
          </button>
        </div>
      </div>

      {activeTab === "profile" && (
        <div className="max-w-2xl space-y-6">
          <Card className="border-border/70 bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="size-4 text-violet-500" />
                Administrative Identity
              </CardTitle>
              <CardDescription className="text-xs">
                Update your administrative display credentials visible across
                system audit streams.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex py-12 justify-center">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      Account Email
                    </Label>
                    <Input
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted/40 font-mono text-xs cursor-not-allowed"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Admin emails cannot be changed directly for platform
                      integrity.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      Admin Full Name
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. Master Administrator"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      Contact Phone Number
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. +1 555-0199"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="flex justify-end pt-3">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="h-9 gap-1.5 text-xs font-bold cursor-pointer bg-violet-600 hover:bg-violet-500 text-white"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Save className="size-3.5" />
                      )}
                      <span>Save Admin Changes</span>
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "security" && (
        <div className="max-w-2xl">
          <ChangePasswordForm />
        </div>
      )}
    </div>
  );
}
