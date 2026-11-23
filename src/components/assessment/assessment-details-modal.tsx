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
  HelpCircle,
  Pencil,
  Shield,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface AssessmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: IAssessment | null;
  onEdit?: (assessment: IAssessment) => void;
}

export function AssessmentDetailsModal({
  isOpen,
  onClose,
  assessment,
  onEdit,
}: AssessmentDetailsModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !assessment) return null;

  const questions = assessment.questions || [];
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/candidate/assessment/${assessment.inviteToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Assessment Link Copied", {
      description: "Candidate link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                <Code2 className="size-4" />
              </span>
              <h2 className="text-lg font-bold text-foreground">
                {assessment.title}
              </h2>
              {assessment.isActive ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold text-[10px]"
                >
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">
                  Draft
                </Badge>
              )}
            </div>
            {assessment.recruiter?.companyName && (
              <p className="text-xs text-muted-foreground">
                Company:{" "}
                <span className="font-semibold text-foreground">
                  {assessment.recruiter.companyName}
                </span>
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          {assessment.description && (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground leading-relaxed">
              {assessment.description}
            </div>
          )}

          {/* Test Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border/70 bg-background/60 p-3 space-y-1">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Clock className="size-3 text-primary" />
                Duration
              </span>
              <p className="text-sm font-bold text-foreground">
                {assessment.durationMinutes} Minutes
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/60 p-3 space-y-1">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <CheckCircle2 className="size-3 text-emerald-500" />
                Passing Score
              </span>
              <p className="text-sm font-bold text-foreground">
                {assessment.passingScore}%
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/60 p-3 space-y-1">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500">
                <Shield className="size-3 text-amber-500" />
                Anti-Cheat Limit
              </span>
              <p className="text-sm font-bold text-foreground">
                Max {assessment.maxTabSwitches} Switches
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/60 p-3 space-y-1">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <GraduationCap className="size-3 text-primary" />
                Total Marks
              </span>
              <p className="text-sm font-bold text-foreground">
                {totalPoints} Points ({questions.length} Qs)
              </p>
            </div>
          </div>

          {/* Public Link Share */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ExternalLink className="size-3.5 text-primary" />
                Assessment Invite Token:{" "}
                <span className="font-mono text-primary">
                  {assessment.inviteToken}
                </span>
              </span>
              <p className="text-[11px] text-muted-foreground">
                Share this link with candidates to let them participate in this
                assessment.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-8 text-xs font-semibold gap-1.5 shrink-0 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          {/* Attached Questions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Code2 className="size-3.5 text-primary" />
                Attached Questions ({questions.length})
              </h3>
              <span className="text-xs font-semibold text-primary">
                Total Score: {totalPoints} pts
              </span>
            </div>

            {questions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
                No questions have been attached to this assessment yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {questions.map((q, idx) => (
                  <div
                    key={q.id || `q-item-${idx}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border/80 bg-background/60 p-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {q.title}
                          </span>
                          <Badge
                            variant={
                              q.type === "CODING" ? "default" : "secondary"
                            }
                            className="text-[10px] uppercase font-bold"
                          >
                            {q.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${
                              q.difficulty === "HARD"
                                ? "border-rose-500/30 text-rose-500 bg-rose-500/5"
                                : q.difficulty === "MEDIUM"
                                  ? "border-amber-500/30 text-amber-500 bg-amber-500/5"
                                  : "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                            }`}
                          >
                            {q.difficulty}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          {q.problemStatement}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-xs font-bold text-emerald-500">
                        {q.points} Points
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/80 px-6 py-3.5 bg-muted/10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8 cursor-pointer"
          >
            Close
          </Button>

          {onEdit && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(assessment);
              }}
              className="text-xs h-8 font-semibold gap-1.5 shadow-xs cursor-pointer"
            >
              <Pencil className="size-3.5" />
              Edit in Studio
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
