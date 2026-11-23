"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IAssessment } from "@/types/assessment.type";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  GraduationCap,
  Mail,
  MoreVertical,
  Pencil,
  Shield,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface AssessmentCardProps {
  assessment: IAssessment;
  onEdit: (assessment: IAssessment) => void;
  onInvite: (assessment: IAssessment) => void;
  onView: (assessment: IAssessment) => void;
  onDelete: (assessment: IAssessment) => void;
}

export function AssessmentCard({
  assessment,
  onEdit,
  onInvite,
  onView,
  onDelete,
}: AssessmentCardProps) {
  const [copied, setCopied] = React.useState(false);

  const questionCount =
    assessment.questions?.length ?? assessment._count?.questions ?? 0;
  const inviteCount = assessment._count?.invites ?? 0;
  const submissionCount = assessment._count?.submissions ?? 0;

  // Calculate total points if questions array is loaded
  const totalPoints = assessment.questions?.reduce(
    (sum, q) => sum + (q.points || 0),
    0,
  );

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/candidate/assessment/${assessment.inviteToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Assessment Link Copied", {
      description: "Direct candidate assessment link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const completionRate =
    inviteCount > 0
      ? Math.min(100, Math.round((submissionCount / inviteCount) * 100))
      : 0;

  return (
    <div
      onClick={() => onView(assessment)}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/70 p-5 shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md cursor-pointer"
    >
      <div className="space-y-3.5">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2">
          {assessment.isActive ? (
            <Badge
              variant="outline"
              className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold text-[10px] uppercase tracking-wider"
            >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="gap-1.5 font-bold text-[10px] uppercase tracking-wider"
            >
              Draft / Inactive
            </Badge>
          )}

          <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
            <Calendar className="size-3" />
            <span>
              {new Date(assessment.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight group-hover:text-primary transition-colors line-clamp-1">
            {assessment.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
            {assessment.description ||
              "Automated technical assessment testing candidate domain proficiency and coding logic."}
          </p>
        </div>

        {/* Specification Chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
            <Clock className="size-3.5 text-primary" />
            {assessment.durationMinutes} Mins
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
            <Code2 className="size-3.5 text-cyan-400" />
            {questionCount} Questions
            {totalPoints !== undefined &&
              totalPoints > 0 &&
              ` (${totalPoints} pts)`}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground">
            <CheckCircle2 className="size-3.5 text-emerald-400" />
            Pass: {assessment.passingScore}%
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-xs font-medium text-amber-500">
            <Shield className="size-3.5 text-amber-400" />
            Max {assessment.maxTabSwitches} Switches
          </span>
        </div>

        {/* Candidate Pipeline Progress */}
        <div className="space-y-1.5 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <GraduationCap className="size-3.5 text-primary" />
              Candidate Pipeline
            </span>
            <span className="font-semibold text-foreground">
              {inviteCount} Invited • {submissionCount} Completed
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/60">
        <Button
          type="button"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onInvite(assessment);
          }}
          className="flex-1 h-8 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
        >
          <Mail className="size-3.5" />
          Invite Candidates
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCopyLink}
          className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
          title="Copy Candidate Assessment Link"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-500" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(assessment);
          }}
          className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
          title="Edit Assessment Studio"
        >
          <Pencil className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(assessment);
          }}
          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          title="Delete Assessment"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
