"use client";

import * as React from "react";
import Link from "next/link";
import {
  useAllUsers,
  useApproveRecruiterApplication,
  useChangeUserStatus,
  useDeleteUser,
  usePendingRecruiterApplications,
  useRejectRecruiterApplication,
} from "@/app/hooks/user-management.hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import type {
  IPlatformUser,
  UserRole,
  UserStatus,
} from "@/types/user-management.type";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Building2,
  CheckCircle2,
  GraduationCap,
  Loader2,
  MoreVertical,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = React.useState<"users" | "applications">(
    "users",
  );
  const [search, setSearch] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<UserRole | "ALL">(
    "ALL",
  );
  const [selectedStatus, setSelectedStatus] = React.useState<
    UserStatus | "ALL"
  >("ALL");

  // Rejection modal state
  const [rejectingAppId, setRejectingAppId] = React.useState<string | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = React.useState("");

  // Queries
  const { data: usersData, isLoading: isUsersLoading } = useAllUsers({
    search: search.trim() || undefined,
    role: selectedRole !== "ALL" ? selectedRole : undefined,
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
  });

  const { data: appsData, isLoading: isAppsLoading } =
    usePendingRecruiterApplications();

  // Mutations
  const changeStatusMutation = useChangeUserStatus();
  const deleteUserMutation = useDeleteUser();
  const approveAppMutation = useApproveRecruiterApplication();
  const rejectAppMutation = useRejectRecruiterApplication();

  const users = usersData?.data || [];
  const applications = appsData?.data || [];

  const handleToggleStatus = async (user: IPlatformUser) => {
    const nextStatus: UserStatus =
      user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    try {
      await changeStatusMutation.mutateAsync({
        id: user.id,
        status: nextStatus,
      });
      toast.success(`User ${user.email} marked as ${nextStatus.toLowerCase()}`);
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (user: IPlatformUser) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete user ${user.email}?`,
      )
    ) {
      return;
    }
    try {
      await deleteUserMutation.mutateAsync(user.id);
      toast.success(`User ${user.email} deleted successfully`);
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleApproveApplication = async (id: string, name: string) => {
    try {
      await approveAppMutation.mutateAsync(id);
      toast.success(`Approved recruiter application for ${name}`);
    } catch {
      toast.error("Failed to approve recruiter application");
    }
  };

  const handleRejectApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAppId) return;

    try {
      await rejectAppMutation.mutateAsync({
        id: rejectingAppId,
        reason: rejectionReason.trim() || undefined,
      });
      toast.success("Recruiter application rejected");
      setRejectingAppId(null);
      setRejectionReason("");
    } catch {
      toast.error("Failed to reject application");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-md shadow-destructive/20">
                <ShieldAlert className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight">
                  DevAssess{" "}
                  <span className="text-destructive text-xs font-semibold">
                    ADMIN
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium -mt-1">
                  User Directory &amp; RBAC
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/admin/dashboard">
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
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title & Main Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              User Directory &amp; Access Control
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage platform developers, recruiter organization access, and
              super admin accounts.
            </p>
          </div>

          <div className="flex rounded-xl bg-muted/60 p-1 border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={cn(
                "flex items-center gap-2 rounded-lg py-1.5 px-3.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "users"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="size-3.5" />
              <span>All Users ({users.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("applications")}
              className={cn(
                "flex items-center gap-2 rounded-lg py-1.5 px-3.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "applications"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Building2 className="size-3.5" />
              <span>Recruiter Requests</span>
              {applications.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-mono text-[10px]">
                  {applications.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: All Users Directory */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md">
              <div className="relative flex-1 max-w-sm">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by email or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 text-xs bg-background"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Role Filter */}
                <select
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(e.target.value as UserRole | "ALL")
                  }
                  className="h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="DEVELOPER">Developers</option>
                  <option value="RECRUITER">Recruiters</option>
                  <option value="ADMIN">Admins</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as UserStatus | "ALL")
                  }
                  className="h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
              {isUsersLoading ? (
                <div className="p-12 text-center space-y-3">
                  <Loader2 className="size-8 animate-spin text-primary mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    Loading platform directory...
                  </p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <Users className="size-8 text-muted-foreground mx-auto" />
                  <p className="text-sm font-bold text-foreground">
                    No users match your filters
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try adjusting your search terms or role filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/30 font-semibold text-muted-foreground">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Verification</th>
                        <th className="py-3 px-4">Registered</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {users.map((u) => {
                        const name =
                          u.adminProfile?.name ||
                          u.recruiterProfile?.name ||
                          u.developerProfile?.name ||
                          u.email.split("@")[0];

                        const avatar =
                          u.adminProfile?.avatarUrl ||
                          u.recruiterProfile?.avatarUrl ||
                          u.developerProfile?.avatarUrl ||
                          undefined;

                        return (
                          <tr
                            key={u.id}
                            className="hover:bg-muted/20 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="size-8 rounded-xl border border-border">
                                  {avatar && (
                                    <AvatarImage src={avatar} alt={name} />
                                  )}
                                  <AvatarFallback className="text-[10px] font-bold uppercase bg-muted">
                                    {name.slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-bold text-foreground">
                                    {name}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground font-mono">
                                    {u.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-mono font-bold uppercase",
                                  u.role === "ADMIN" &&
                                    "border-destructive/40 text-destructive bg-destructive/10",
                                  u.role === "RECRUITER" &&
                                    "border-blue-500/40 text-blue-500 bg-blue-500/10",
                                  u.role === "DEVELOPER" &&
                                    "border-emerald-500/40 text-emerald-500 bg-emerald-500/10",
                                )}
                              >
                                {u.role}
                              </Badge>
                            </td>

                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-bold",
                                  u.status === "ACTIVE"
                                    ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                                    : "border-rose-500/40 text-rose-500 bg-rose-500/10",
                                )}
                              >
                                {u.status}
                              </Badge>
                            </td>

                            <td className="py-3 px-4">
                              {u.isVerified ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                                  <CheckCircle2 className="size-3.5" /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                                  <AlertTriangle className="size-3.5" />{" "}
                                  Unverified
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(u)}
                                  disabled={changeStatusMutation.isPending}
                                  className={cn(
                                    "h-7 px-2 text-xs font-semibold cursor-pointer",
                                    u.status === "ACTIVE"
                                      ? "text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                                      : "text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600",
                                  )}
                                >
                                  {u.status === "ACTIVE" ? (
                                    <>
                                      <Ban className="size-3 mr-1" />
                                      Block
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="size-3 mr-1" />
                                      Activate
                                    </>
                                  )}
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteUser(u)}
                                  disabled={deleteUserMutation.isPending}
                                  className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                  title="Delete user"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Recruiter Organization Applications */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md">
              <h2 className="text-sm font-bold text-foreground">
                Pending Recruiter Verifications
              </h2>
              <p className="text-xs text-muted-foreground">
                Review incoming corporate requests to create hiring assessments
                on the DevAssess network.
              </p>
            </div>

            {isAppsLoading ? (
              <div className="p-12 text-center rounded-2xl border border-border bg-card">
                <Loader2 className="size-8 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground mt-2">
                  Checking recruiter applications...
                </p>
              </div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-2">
                <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-foreground">
                  All Caught Up!
                </p>
                <p className="text-xs text-muted-foreground">
                  There are no pending recruiter applications requiring approval
                  right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl border border-border/70 bg-card hover:border-primary/40 transition-all space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          <Building2 className="size-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-foreground">
                            {app.companyName}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {app.name} • {app.designation}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px] font-bold">
                        Pending Approval
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 font-mono text-xs text-muted-foreground space-y-1">
                      <div>
                        Email:{" "}
                        <strong className="text-foreground">
                          {app.user?.email}
                        </strong>
                      </div>
                      <div>
                        Submitted:{" "}
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectingAppId(app.id)}
                        className="h-8 text-xs font-semibold text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <XCircle className="size-3.5 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleApproveApplication(app.id, app.name)
                        }
                        disabled={approveAppMutation.isPending}
                        className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                      >
                        <CheckCircle2 className="size-3.5 mr-1" />
                        Approve Recruiter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Reject Reason Modal */}
      {rejectingAppId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
        >
          <div className="rounded-3xl border border-border bg-card p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-foreground">
              Reject Recruiter Application
            </h3>
            <p className="text-xs text-muted-foreground">
              Optionally provide a reason why this recruiter profile cannot be
              approved at this time.
            </p>

            <form onSubmit={handleRejectApplication} className="space-y-4">
              <textarea
                placeholder="Reason (e.g. Unverified business email domain or incomplete company info)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-destructive resize-none"
              />

              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRejectingAppId(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={rejectAppMutation.isPending}
                  className="text-xs font-bold bg-destructive hover:bg-destructive/90 text-white"
                >
                  Confirm Rejection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
