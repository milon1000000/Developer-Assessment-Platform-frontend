"use client";

import * as React from "react";
import {
  useReviewSubmission,
  useSubmission,
} from "@/app/hooks/submission.hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ISubmission } from "@/types/submission.type";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Code2,
  FileCheck2,
  FileCode,
  GraduationCap,
  ListOrdered,
  Loader2,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Terminal,
  User,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface SubmissionScorecardModalProps {
  submissionId: string | null;
  onClose: () => void;
  isRecruiter?: boolean;
}

type TabType = "questions" | "anti-cheat" | "review";

// Render basic inline markdown (**bold** and `code`) safely as JSX
function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  let offset = 0;
  return parts.map((part) => {
    const tokenKey = `${offset}-${part.length}`;
    offset += part.length;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={tokenKey} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={tokenKey}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={tokenKey}>{part}</React.Fragment>;
  });
}

export function SubmissionScorecardModal({
  submissionId,
  onClose,
  isRecruiter = true,
}: SubmissionScorecardModalProps) {
  const { data: detailData, isLoading } = useSubmission(
    submissionId || "",
    Boolean(submissionId),
  );
  const reviewMutation = useReviewSubmission();

  const [activeTab, setActiveTab] = React.useState<TabType>("questions");
  const [feedback, setFeedback] = React.useState("");
  const [totalScore, setTotalScore] = React.useState<number>(0);

  const submission = detailData?.data;

  React.useEffect(() => {
    if (submission) {
      setFeedback(submission.feedback || "");
      setTotalScore(submission.totalScore || 0);
    }
  }, [submission]);

  if (!submissionId) return null;

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId) return;

    try {
      await reviewMutation.mutateAsync({
        submissionId,
        payload: {
          feedback: feedback.trim(),
          totalScore: Number(totalScore),
        },
      });
      toast.success("Scorecard review and feedback saved successfully");
      onClose();
    } catch {
      toast.error("Failed to update submission review. Please try again.");
    }
  };

  const devName =
    submission?.developer?.name ||
    submission?.developer?.user?.email?.split("@")[0] ||
    "Candidate";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in-0 duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} aria-label="Backdrop" />

      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-border/80 bg-card shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-border/70 bg-muted/20 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar className="size-11 shrink-0 border-2 border-primary/30 shadow-md">
              {submission?.developer?.avatarUrl && (
                <AvatarImage
                  src={submission.developer.avatarUrl}
                  alt={devName}
                />
              )}
              <AvatarFallback className="text-sm font-bold bg-primary/20 text-primary">
                {devName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {devName}
                </h2>
                {submission?.isPassed ? (
                  <Badge
                    variant="default"
                    className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] font-bold"
                  >
                    <CheckCircle2 className="size-3 mr-1" />
                    PASSED ({submission?.percentage}%)
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-rose-500/15 text-rose-500 border-rose-500/30 text-[10px] font-bold"
                  >
                    <XCircle className="size-3 mr-1" />
                    FAILED ({submission?.percentage}%)
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono break-words">
                {submission?.developer?.user?.email} • Assessment:{" "}
                <span className="font-semibold text-foreground">
                  {submission?.assessment?.title}
                </span>
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 shrink-0 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-border/60 bg-muted/10 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={cn(
              "flex items-center gap-2 py-2 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0",
              activeTab === "questions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Code2 className="size-4" />
            <span>Questions & Code ({submission?.answers?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("anti-cheat")}
            className={cn(
              "flex items-center gap-2 py-2 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0",
              activeTab === "anti-cheat"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <ShieldCheck className="size-4" />
            <span>
              Proctoring Telemetry ({submission?.proctorLogs?.length || 0})
            </span>
          </button>

          {isRecruiter && (
            <button
              type="button"
              onClick={() => setActiveTab("review")}
              className={cn(
                "flex items-center gap-2 py-2 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0",
                activeTab === "review"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Star className="size-4" />
              <span>Recruiter Review & Scoring</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="size-8 animate-spin text-primary mx-auto" />
              <p className="text-xs text-muted-foreground">
                Retrieving detailed candidate scorecard...
              </p>
            </div>
          ) : activeTab === "questions" ? (
            /* TAB 1: Questions & Code Solutions */
            <div className="space-y-4">
              {!isRecruiter && submission?.feedback && (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Star className="size-4 text-primary" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Recruiter Review &amp; Feedback
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                      <span>
                        Score: {submission.totalScore} /{" "}
                        {submission.maxScore || 100} Pts
                      </span>
                      {submission.reviewedAt && (
                        <span>
                          • Reviewed{" "}
                          {new Date(submission.reviewedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {submission.feedback}
                  </p>
                </div>
              )}

              {submission?.answers && submission.answers.length > 0 ? (
                submission.answers.map((ans, idx) => (
                  <div
                    key={ans.id}
                    className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-lg bg-primary/15 text-primary flex items-center justify-center text-xs font-bold font-mono">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-foreground">
                          {ans.question?.title || `Question ${idx + 1}`}
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-bold uppercase"
                        >
                          {ans.question?.type || "CODING"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold font-mono text-emerald-500">
                          {ans.scoreEarned} / {ans.question?.points || 10} Pts
                        </span>
                        {ans.question?.type === "CODING" && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono"
                          >
                            {ans.passedTestCases}/{ans.totalTestCases} Tests
                            Passed
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Question Statement */}
                    {ans.question?.problemStatement && (
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {renderInlineMarkdown(ans.question.problemStatement)}
                      </p>
                    )}

                    {/* Coding Solution */}
                    {ans.question?.type === "CODING" ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                          <span>Language: {ans.language || "JavaScript"}</span>
                          <span>Candidate Code:</span>
                        </div>
                        <pre className="p-3.5 rounded-xl bg-slate-950 border border-border/80 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
                          <code>{ans.code || "// No code submitted"}</code>
                        </pre>
                      </div>
                    ) : (
                      /* MCQ Selection */
                      <div className="rounded-xl border border-border/70 p-3 bg-muted/20 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">
                          Selected Option:
                        </span>
                        <span className="font-bold text-foreground font-mono">
                          {ans.selectedOption || "None"}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No question responses recorded for this candidate.
                </p>
              )}
            </div>
          ) : activeTab === "anti-cheat" ? (
            /* TAB 2: Anti-Cheat Proctoring Logs */
            <div className="space-y-3">
              <div className="rounded-2xl border border-border/70 bg-muted/10 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Anti-Cheat Session Summary
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Telemetry captured by client proctoring engine
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-foreground">
                      {submission?.tabSwitchCount || 0} Tab Switches
                    </span>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      Max Allowed: {submission?.assessment?.maxTabSwitches || 3}
                    </p>
                  </div>
                  {submission?.status === "DISQUALIFIED" ? (
                    <Badge variant="destructive" className="gap-1 text-[10px]">
                      <Ban className="size-3" />
                      DISQUALIFIED
                    </Badge>
                  ) : (
                    <Badge
                      variant="default"
                      className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px]"
                    >
                      <ShieldCheck className="size-3 mr-1" />
                      Session Valid
                    </Badge>
                  )}
                </div>
              </div>

              {/* Logs List */}
              <div className="space-y-2">
                {submission?.proctorLogs &&
                submission.proctorLogs.length > 0 ? (
                  submission.proctorLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-border/70 bg-card/70 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "size-2 rounded-full",
                            log.eventType === "TAB_SWITCH"
                              ? "bg-amber-500"
                              : "bg-purple-500",
                          )}
                        />
                        <span className="font-bold text-foreground">
                          {log.eventType}
                        </span>
                        {log.details && (
                          <span className="text-muted-foreground text-[11px] truncate max-w-sm">
                            {log.details}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    No proctoring violations or tab-switch telemetry recorded.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* TAB 3: Recruiter Manual Review & Scoring */
            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Adjust Total Score (Max {submission?.maxScore || 100})
                  </Label>
                  <Input
                    type="number"
                    value={totalScore}
                    onChange={(e) => setTotalScore(Number(e.target.value))}
                    min={0}
                    max={submission?.maxScore || 100}
                    className="h-10 text-xs font-mono font-bold"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Adjusting the score recalculates percentage and passing
                    determination.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Grading Status & Verdict
                  </Label>
                  <div className="h-10 rounded-xl border border-border/80 bg-muted/20 px-3 flex items-center justify-between text-xs font-bold">
                    <span>Final Outcome:</span>
                    <span
                      className={
                        submission?.isPassed
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }
                    >
                      {submission?.isPassed ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  Recruiter Feedback & Code Notes
                </Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide personalized technical feedback regarding candidate's code modularity, algorithmic time complexity, and interview readiness..."
                  rows={4}
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="h-10 gap-2 text-xs font-bold cursor-pointer"
                >
                  {reviewMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  <span>Save Review & Finalize</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
