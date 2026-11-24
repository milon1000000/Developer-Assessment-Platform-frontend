"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ISubmission } from "@/types/submission.type";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileCheck2,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";

interface SubmissionTableProps {
  submissions: ISubmission[];
  isLoading: boolean;
  onSelectSubmission: (submission: ISubmission) => void;
  selectedSubmissionId?: string | null;
  page?: number;
  totalPages?: number;
  onPageChange?: (newPage: number) => void;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function SubmissionTable({
  submissions,
  isLoading,
  onSelectSubmission,
  selectedSubmissionId,
  page = 1,
  totalPages = 1,
  onPageChange,
}: SubmissionTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/60 p-12 text-center space-y-3">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-medium text-muted-foreground">
          Loading candidate submissions...
        </p>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
        <div className="size-12 rounded-2xl bg-muted/30 text-muted-foreground flex items-center justify-center mx-auto">
          <FileCheck2 className="size-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">
          No Candidate Submissions Found
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No candidates have completed or started an assessment matching your
          current search and filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 shadow-sm backdrop-blur-md overflow-hidden flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border/60 bg-muted/20 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-3 px-4">Candidate</th>
              <th className="py-3 px-4">Score & Outcome</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Anti-Cheat Integrity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 font-medium">
            {submissions.map((sub) => {
              const devName =
                sub.developer?.name ||
                sub.developer?.user?.email?.split("@")[0] ||
                "Candidate";
              const devEmail = sub.developer?.user?.email || "No email";
              const isSelected = selectedSubmissionId === sub.id;

              return (
                <tr
                  key={sub.id}
                  onClick={() => onSelectSubmission(sub)}
                  className={cn(
                    "transition-colors cursor-pointer hover:bg-muted/40",
                    isSelected
                      ? "bg-primary/10 border-l-4 border-primary"
                      : "border-l-4 border-transparent",
                  )}
                >
                  {/* Candidate Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 shrink-0 border border-primary/20">
                        {sub.developer?.avatarUrl && (
                          <AvatarImage
                            src={sub.developer.avatarUrl}
                            alt={devName}
                          />
                        )}
                        <AvatarFallback className="text-[10px] font-bold bg-primary/15 text-primary">
                          {getInitials(devName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {devName}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          {devEmail}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Score & Outcome */}
                  <td className="py-3.5 px-4">
                    {sub.status === "SUBMITTED" ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-foreground">
                            {sub.totalScore} / {sub.maxScore || 100}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            ({sub.percentage}%)
                          </span>
                        </div>
                        {sub.isPassed ? (
                          <Badge
                            variant="default"
                            className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[9px] font-bold py-0.2"
                          >
                            <CheckCircle2 className="size-2.5 mr-1" />
                            PASSED
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-rose-500/15 text-rose-500 border border-rose-500/30 text-[9px] font-bold py-0.2"
                          >
                            <XCircle className="size-2.5 mr-1" />
                            FAILED
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Grading Pending
                      </span>
                    )}
                  </td>

                  {/* Time Spent */}
                  <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <Clock className="size-3 text-muted-foreground" />
                      {formatDuration(sub.timeSpentSeconds)}
                    </span>
                  </td>

                  {/* Anti-Cheat Telemetry */}
                  <td className="py-3.5 px-4">
                    {sub.status === "DISQUALIFIED" ? (
                      <Badge
                        variant="destructive"
                        className="text-[9px] font-bold gap-1 py-0.5"
                      >
                        <Ban className="size-3" />
                        DISQUALIFIED
                      </Badge>
                    ) : sub.tabSwitchCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-500">
                        <AlertTriangle className="size-3" />
                        {sub.tabSwitchCount} Tab{" "}
                        {sub.tabSwitchCount === 1 ? "Switch" : "Switches"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500">
                        <ShieldCheck className="size-3" />
                        Clean Session
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        sub.status === "SUBMITTED"
                          ? "default"
                          : sub.status === "IN_PROGRESS"
                            ? "secondary"
                            : "outline"
                      }
                      className={cn(
                        "text-[9px] font-bold uppercase",
                        sub.status === "SUBMITTED" &&
                          "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
                        sub.status === "IN_PROGRESS" &&
                          "bg-amber-500/15 text-amber-500 border-amber-500/30",
                        sub.status === "EXPIRED" &&
                          "bg-slate-500/15 text-slate-400 border-slate-500/30",
                      )}
                    >
                      {sub.status}
                    </Badge>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSubmission(sub);
                      }}
                      className="h-8 gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      <span>Scorecard</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && onPageChange && (
        <div className="p-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page <strong className="text-foreground">{page}</strong> of{" "}
            <strong className="text-foreground">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="size-8 cursor-pointer"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8 cursor-pointer"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
