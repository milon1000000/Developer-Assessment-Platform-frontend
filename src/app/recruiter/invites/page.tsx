"use client";

import * as React from "react";
import {
  useAllAssessmentInvites,
  useAssessments,
  useDeleteAssessmentInvite,
  useResendAssessmentInvite,
} from "@/app/hooks/assessment.hooks";
import { AssessmentInviteModal } from "@/components/assessment/assessment-invite-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AssessmentInviteQueryParams,
  IAssessmentInvite,
  InviteStatus,
} from "@/types/assessment.type";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  SlidersHorizontal,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function RecruiterInvitesPage() {
  const [queryParams, setQueryParams] = React.useState<
    AssessmentInviteQueryParams & { assessmentId?: string }
  >({
    page: 1,
    limit: 15,
    sortBy: "sentAt",
    sortOrder: "desc",
  });

  const [localSearch, setLocalSearch] = React.useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);

  // Fetch all recruiter invites
  const { data: invitesData, isLoading: isLoadingInvites } =
    useAllAssessmentInvites(queryParams);

  // Fetch recruiter assessments for dropdown filter
  const { data: assessmentsData } = useAssessments({ limit: 50 });
  const assessments = assessmentsData?.data || [];

  const resendMutation = useResendAssessmentInvite();
  const deleteMutation = useDeleteAssessmentInvite();

  const invites = invitesData?.data || [];
  const meta = invitesData?.meta;

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (queryParams.searchTerm || "")) {
        setQueryParams((prev) => ({
          ...prev,
          searchTerm: localSearch || undefined,
          page: 1,
        }));
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [localSearch, queryParams.searchTerm]);

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/assessment/take/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    toast.success("Assessment Token Link Copied", {
      description: "Candidate test access link copied to clipboard.",
    });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleResend = async (invite: IAssessmentInvite) => {
    try {
      await resendMutation.mutateAsync(invite.id);
      toast.success("Invitation Resent", {
        description: `Fresh test invitation email dispatched to ${invite.email}.`,
      });
    } catch {
      toast.error("Resend Failed", {
        description: "Failed to resend candidate invitation email.",
      });
    }
  };

  const handleDeleteInvite = async (invite: IAssessmentInvite) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel the invitation for "${invite.email}"?`,
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(invite.id);
      toast.success("Invitation Cancelled", {
        description: `Candidate token for ${invite.email} has been revoked.`,
      });
    } catch {
      toast.error("Cancel Failed", {
        description: "Failed to cancel invitation.",
      });
    }
  };

  const handleResetFilters = () => {
    setLocalSearch("");
    setQueryParams({
      page: 1,
      limit: 15,
      sortBy: "sentAt",
      sortOrder: "desc",
      assessmentId: undefined,
      status: undefined,
    });
  };

  // KPI calculations
  const totalInvites = meta?.total || invites.length;
  const completedCount = invites.filter((i) => i.status === "ACCEPTED").length;
  const pendingCount = invites.filter((i) => i.status === "PENDING").length;
  const expiredCount = invites.filter((i) => i.status === "EXPIRED").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-xl bg-cyan-600/15 border border-cyan-500/30 text-cyan-400">
                <Mail className="size-4" />
              </span>
              <span>Candidate Invitations Hub</span>
            </h1>
            <Badge
              variant="outline"
              className="text-xs font-mono border-cyan-500/30 text-cyan-400"
            >
              {totalInvites} Invites
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Distribute secure assessment tokens, monitor real-time test status,
            and audit candidate evaluation pipeline.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="h-9 gap-1.5 text-xs font-bold shadow-md cursor-pointer bg-cyan-600 hover:bg-cyan-500 text-white self-start sm:self-auto"
        >
          <Plus className="size-4" />
          Send New Invitations
        </Button>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Total Invitations</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Mail className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-foreground">{totalInvites}</p>
          <p className="text-[11px] text-muted-foreground">
            Total candidate tokens issued
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Completed Tests</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-500">
            {completedCount}
          </p>
          <p className="text-[11px] text-emerald-500 font-medium">
            Submitted candidate evaluations
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Pending Starts</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-500">{pendingCount}</p>
          <p className="text-[11px] text-muted-foreground">
            Awaiting candidate initiation
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Expired Links</span>
            <span className="p-1.5 rounded-lg bg-muted text-muted-foreground">
              <Calendar className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-foreground">{expiredCount}</p>
          <p className="text-[11px] text-muted-foreground">
            Passed token deadline
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-3 sm:p-4 shadow-xs backdrop-blur-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Candidate Email or Title */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by candidate email or assessment title..."
              className="pl-9 text-xs h-9"
            />
          </div>

          {/* Assessment Picker Filter */}
          <div className="w-full md:w-64 shrink-0">
            <select
              value={queryParams.assessmentId || ""}
              onChange={(e) =>
                setQueryParams((prev) => ({
                  ...prev,
                  assessmentId: e.target.value || undefined,
                  page: 1,
                }))
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary font-medium cursor-pointer"
            >
              <option value="">All Assessments ({assessments.length})</option>
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <Button
              type="button"
              variant={!queryParams.status ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setQueryParams((prev) => ({
                  ...prev,
                  status: undefined,
                  page: 1,
                }))
              }
              className="h-8 text-xs font-semibold px-3"
            >
              All
            </Button>
            <Button
              type="button"
              variant={
                queryParams.status === "ACCEPTED" ? "default" : "outline"
              }
              size="sm"
              onClick={() =>
                setQueryParams((prev) => ({
                  ...prev,
                  status: "ACCEPTED" as InviteStatus,
                  page: 1,
                }))
              }
              className="h-8 text-xs font-semibold px-3 gap-1.5"
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Completed
            </Button>
            <Button
              type="button"
              variant={queryParams.status === "PENDING" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setQueryParams((prev) => ({
                  ...prev,
                  status: "PENDING" as InviteStatus,
                  page: 1,
                }))
              }
              className="h-8 text-xs font-semibold px-3 gap-1.5"
            >
              <span className="size-1.5 rounded-full bg-amber-500" />
              Pending
            </Button>
            <Button
              type="button"
              variant={queryParams.status === "EXPIRED" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setQueryParams((prev) => ({
                  ...prev,
                  status: "EXPIRED" as InviteStatus,
                  page: 1,
                }))
              }
              className="h-8 text-xs font-semibold px-3"
            >
              Expired
            </Button>
          </div>
        </div>

        {/* Secondary Row: Sorting & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <span className="font-medium">Sort by:</span>
            <select
              value={`${queryParams.sortBy || "sentAt"}-${queryParams.sortOrder || "desc"}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                setQueryParams((prev) => ({
                  ...prev,
                  sortBy,
                  sortOrder: sortOrder as "asc" | "desc",
                  page: 1,
                }));
              }}
              className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="sentAt-desc">Recently Sent First</option>
              <option value="sentAt-asc">Oldest Sent First</option>
              <option value="email-asc">Email (A-Z)</option>
              <option value="status-asc">Status</option>
            </select>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 cursor-pointer"
          >
            <RotateCcw className="size-3" />
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Candidate Invitations Responsive Table */}
      <div className="rounded-2xl border border-border/80 bg-card/70 shadow-xs backdrop-blur-xs overflow-hidden">
        {isLoadingInvites ? (
          <div className="p-12 text-center space-y-2">
            <Loader2 className="size-7 animate-spin mx-auto text-primary" />
            <p className="text-xs font-semibold text-foreground">
              Loading candidate invitations...
            </p>
          </div>
        ) : invites.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-cyan-600/10 text-cyan-400 flex items-center justify-center mx-auto">
              <Mail className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                No Invitations Found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No candidate invitations match your current filters. Send
                invitations to candidates to evaluate them.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              size="sm"
              className="text-xs font-bold gap-1.5 shadow-sm cursor-pointer bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              <Plus className="size-3.5" />
              Invite Candidates Now
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground border-b border-border/80 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Candidate Email & Token</th>
                  <th className="px-4 py-3.5">Assessment</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Sent Date</th>
                  <th className="px-4 py-3.5">Expires</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-medium">
                {invites.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Candidate Email + Token */}
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-foreground text-xs flex items-center gap-2">
                        <span className="size-6 rounded-full bg-cyan-600/15 text-cyan-500 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                          {inv.email.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate max-w-[220px]">
                          {inv.email}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5 pl-8 truncate max-w-[220px]">
                        Token: {inv.token}
                      </div>
                    </td>

                    {/* Assessment Info */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground truncate max-w-[200px]">
                        {inv.assessment?.title || "Assessment"}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {inv.assessment?.durationMinutes || 60} mins • Pass:{" "}
                        {inv.assessment?.passingScore || 60}%
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      {inv.status === "ACCEPTED" ? (
                        <Badge
                          variant="default"
                          className="bg-emerald-600 text-[10px] font-bold"
                        >
                          Completed
                        </Badge>
                      ) : inv.status === "EXPIRED" ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Expired
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-500/30 text-amber-500 bg-amber-500/5 text-[10px] font-bold"
                        >
                          Pending
                        </Badge>
                      )}
                    </td>

                    {/* Sent Date */}
                    <td className="px-4 py-3.5 text-muted-foreground text-[11px]">
                      {new Date(inv.sentAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Expiration Date */}
                    <td className="px-4 py-3.5 text-muted-foreground text-[11px]">
                      {inv.expiresAt
                        ? new Date(inv.expiresAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "No Expiry"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right space-x-1.5 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(inv.token)}
                        className="h-7 text-xs font-semibold gap-1 px-2.5 cursor-pointer"
                        title="Copy Candidate Assessment Link"
                      >
                        {copiedToken === inv.token ? (
                          <>
                            <Check className="size-3 text-emerald-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            Link
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResend(inv)}
                        disabled={resendMutation.isPending}
                        className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Resend Invitation Email"
                      >
                        <RefreshCw className="size-3" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteInvite(inv)}
                        disabled={deleteMutation.isPending}
                        className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        title="Cancel Invitation"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Global Assessment Invite Modal */}
      <AssessmentInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
