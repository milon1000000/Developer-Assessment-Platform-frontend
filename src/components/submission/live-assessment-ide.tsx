"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  useRecordProctorEvent,
  useRunCode,
  useSaveAnswer,
  useSubmitExam,
} from "@/app/hooks/submission.hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  IAssessmentQuestion,
  IRunCodeResult,
  ISubmission,
} from "@/types/submission.type";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle2,
  Clock,
  CloudCheck,
  Code2,
  Loader2,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface LiveAssessmentIdeProps {
  initialSubmission: ISubmission;
  assessment: {
    id: string;
    title: string;
    description?: string | null;
    durationMinutes: number;
    passingScore: number;
    maxTabSwitches: number;
    questions: IAssessmentQuestion[];
  };
}

export function LiveAssessmentIde({
  initialSubmission,
  assessment,
}: LiveAssessmentIdeProps) {
  const router = useRouter();
  const submissionId = initialSubmission.id;

  const saveAnswerMutation = useSaveAnswer();
  const runCodeMutation = useRunCode();
  const proctorMutation = useRecordProctorEvent();
  const submitExamMutation = useSubmitExam();

  const [activeQuestionIndex, setActiveQuestionIndex] = React.useState(0);
  const [answersMap, setAnswersMap] = React.useState<{
    [questionId: string]: {
      code?: string;
      selectedOption?: string;
      language?: string;
    };
  }>({});
  const [saveStatus, setSaveStatus] = React.useState<
    "saved" | "saving" | "unsaved"
  >("saved");
  const [runResult, setRunResult] = React.useState<IRunCodeResult | null>(null);
  const [tabSwitches, setTabSwitches] = React.useState(
    initialSubmission.tabSwitchCount || 0,
  );
  const [isDisqualified, setIsDisqualified] = React.useState(
    initialSubmission.status === "DISQUALIFIED",
  );
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState("javascript");

  const currentQuestion = assessment.questions[activeQuestionIndex];

  // Initialize draft answers from existing submission
  React.useEffect(() => {
    if (initialSubmission.answers) {
      const initialMap: typeof answersMap = {};
      for (const ans of initialSubmission.answers) {
        initialMap[ans.questionId] = {
          code: ans.code || undefined,
          selectedOption: ans.selectedOption || undefined,
          language: ans.language || "javascript",
        };
      }
      setAnswersMap(initialMap);
    }
  }, [initialSubmission]);

  // Countdown Timer Logic
  const [remainingSeconds, setRemainingSeconds] = React.useState(() => {
    const startTime = new Date(initialSubmission.startedAt).getTime();
    const durationMs = assessment.durationMinutes * 60 * 1000;
    const elapsedMs = Date.now() - startTime;
    const remaining = Math.max(0, Math.floor((durationMs - elapsedMs) / 1000));
    return remaining;
  });

  // Countdown timer tick
  React.useEffect(() => {
    if (isDisqualified) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDisqualified]);

  // Anti-Cheat Proctoring Event Listeners
  React.useEffect(() => {
    if (isDisqualified) return;

    const reportProctor = async (
      eventType: "TAB_SWITCH" | "WINDOW_BLUR" | "COPY_PASTE",
      details?: string,
    ) => {
      try {
        const res = await proctorMutation.mutateAsync({
          submissionId,
          payload: { eventType, details },
        });

        if (res.data?.tabSwitchCount !== undefined) {
          setTabSwitches(res.data.tabSwitchCount);
        }

        if (res.data?.disqualified) {
          setIsDisqualified(true);
          toast.error("Disqualified", {
            description:
              res.data.message || "Exceeded maximum allowed tab switches.",
          });
        } else if (eventType === "TAB_SWITCH") {
          toast.warning("Tab Switch Monitored", {
            description: `You switched tabs (${res.data?.tabSwitchCount}/${assessment.maxTabSwitches}). Please stay in the assessment window.`,
          });
        }
      } catch {
        // Silent fail for network glitches
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportProctor("TAB_SWITCH", "User navigated away from active tab");
      }
    };

    const handleBlur = () => {
      reportProctor("WINDOW_BLUR", "Exam window lost focus");
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      reportProctor("COPY_PASTE", `Action: ${e.type}`);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
    };
  }, [isDisqualified, submissionId, assessment.maxTabSwitches]);

  // Auto-save debounced handler
  const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleCodeChange = (newCode: string) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setAnswersMap((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], code: newCode, language: selectedLanguage },
    }));
    setSaveStatus("unsaved");

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await saveAnswerMutation.mutateAsync({
          submissionId,
          payload: {
            questionId: qId,
            code: newCode,
            language: selectedLanguage,
          },
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("unsaved");
      }
    }, 1200);
  };

  const handleSelectOption = async (option: string) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setAnswersMap((prev) => ({
      ...prev,
      [qId]: { ...prev[qId], selectedOption: option },
    }));

    setSaveStatus("saving");
    try {
      await saveAnswerMutation.mutateAsync({
        submissionId,
        payload: {
          questionId: qId,
          selectedOption: option,
        },
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("unsaved");
    }
  };

  // Run Code in Sandbox
  const handleRunCode = async () => {
    if (!currentQuestion || currentQuestion.type !== "CODING") return;
    const code =
      answersMap[currentQuestion.id]?.code ||
      currentQuestion.starterCode?.[selectedLanguage] ||
      "";

    try {
      const res = await runCodeMutation.mutateAsync({
        submissionId,
        payload: {
          questionId: currentQuestion.id,
          code,
          language: selectedLanguage,
        },
      });
      if (res?.data) {
        setRunResult(res.data);
        if (res.data.allPassed) {
          toast.success("All sample test cases passed!");
        } else {
          toast.warning(
            `${res.data.passedTestCases}/${res.data.totalTestCases} test cases passed`,
          );
        }
      }
    } catch {
      toast.error("Failed to run code suite. Please verify your syntax.");
    }
  };

  // Submit Final Exam
  const handleFinalSubmit = async (isAutoExpire = false) => {
    try {
      await submitExamMutation.mutateAsync(submissionId);
      toast.success(
        isAutoExpire ? "Exam Time Expired" : "Assessment Submitted!",
        {
          description: "Your answers were graded automatically.",
        },
      );
      router.push(`/candidate/submissions`);
    } catch {
      toast.error("Failed to submit assessment. Please try again.");
    }
  };

  const currentCode =
    answersMap[currentQuestion?.id]?.code ??
    (currentQuestion?.starterCode?.[selectedLanguage] ||
      currentQuestion?.starterCode?.javascript ||
      "// Write your solution here\n");

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isDisqualified) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="rounded-3xl border border-destructive/50 bg-card p-8 text-center space-y-4 max-w-md w-full shadow-2xl">
          <div className="size-14 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mx-auto">
            <Ban className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Assessment Session Disqualified
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You exceeded the allowable tab-switch policy (
            {assessment.maxTabSwitches} switches). In accordance with the
            proctoring rules, your session was terminated and flagged for
            review.
          </p>
          <Button
            type="button"
            onClick={() => router.push("/candidate/dashboard")}
            className="w-full text-xs font-semibold cursor-pointer"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Header Bar */}
      <header className="border-b border-border/70 bg-card/70 backdrop-blur-md px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-mono font-bold text-sm shadow-md">
            &lt;/&gt;
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-foreground">
                DevAssess
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                • {assessment.title}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">
              Question {activeQuestionIndex + 1} of{" "}
              {assessment.questions.length}
            </p>
          </div>
        </div>

        {/* Live Proctoring & Countdown Bar */}
        <div className="flex items-center gap-2.5">
          {/* Anti-cheat tab switch meter */}
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-colors",
              tabSwitches > 0
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
            )}
          >
            <ShieldCheck className="size-3.5" />
            <span>
              {tabSwitches}/{assessment.maxTabSwitches} Switches
            </span>
          </div>

          {/* Live countdown timer */}
          <div
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono text-xs font-bold",
              remainingSeconds < 300
                ? "bg-destructive/15 border-destructive/40 text-destructive animate-pulse"
                : "bg-muted/40 border-border text-foreground",
            )}
          >
            <Clock className="size-3.5" />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

          {/* Submit Exam Button */}
          <Button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="h-9 gap-1.5 text-xs font-bold shadow-md cursor-pointer bg-primary hover:bg-primary/90"
          >
            <Send className="size-3.5" />
            <span>Submit Exam</span>
          </Button>
        </div>
      </header>

      {/* Question Selector Tabs */}
      <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 border-b border-border/60 bg-muted/20 overflow-x-auto">
        {assessment.questions.map((q, idx) => {
          const hasAnswer = Boolean(
            answersMap[q.id]?.code || answersMap[q.id]?.selectedOption,
          );
          const isActive = idx === activeQuestionIndex;

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                setActiveQuestionIndex(idx);
                setRunResult(null);
              }}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="font-mono text-[11px] font-bold">
                Q{idx + 1}
              </span>
              <span className="truncate max-w-[140px]">{q.title}</span>
              {hasAnswer && (
                <CheckCircle2
                  className={cn(
                    "size-3",
                    isActive ? "text-primary-foreground" : "text-emerald-500",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Split Arena */}
      <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Problem Statement Pane (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-border/80 bg-card/60 flex flex-col justify-between overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border/60 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase"
              >
                {currentQuestion?.difficulty}
              </Badge>
              <span className="text-xs font-bold text-foreground">
                {currentQuestion?.title}
              </span>
            </div>
            <span className="text-xs font-bold text-primary font-mono">
              {currentQuestion?.points || 10} Points
            </span>
          </div>

          <div className="p-5 space-y-4 text-xs text-foreground/90 overflow-y-auto flex-1 leading-relaxed">
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Problem Description
              </h4>
              <p className="whitespace-pre-line leading-relaxed">
                {currentQuestion?.problemStatement}
              </p>
            </div>

            {/* Constraints */}
            {currentQuestion?.constraints && (
              <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Constraints:
                </span>
                <p className="font-mono text-[11px] text-muted-foreground whitespace-pre-line">
                  {currentQuestion.constraints}
                </p>
              </div>
            )}

            {/* MCQ Options Selector */}
            {currentQuestion?.type === "MCQ" && currentQuestion.mcqOptions && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Correct Option:
                </span>
                <div className="space-y-2">
                  {currentQuestion.mcqOptions.map((opt: any) => {
                    const isSelected =
                      answersMap[currentQuestion.id]?.selectedOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer",
                          isSelected
                            ? "bg-primary/15 border-primary text-primary font-bold shadow-xs"
                            : "bg-card border-border hover:bg-muted/30 text-foreground",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="size-5 rounded-md bg-muted flex items-center justify-center font-mono text-[10px] uppercase">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </span>
                        {isSelected && <CheckCircle2 className="size-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sync Status Footer */}
          <div className="p-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="size-3 animate-spin text-primary" />
                  <span>Syncing answer...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  <span>All changes auto-saved</span>
                </>
              )}
            </span>
            <span className="font-mono">POST /:id/answer</span>
          </div>
        </div>

        {/* Right Code Editor & Sandbox Console (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {currentQuestion?.type === "CODING" ? (
            <>
              {/* Code Editor */}
              <div className="rounded-2xl border border-border/80 bg-card/60 flex flex-col overflow-hidden shadow-sm flex-1">
                {/* Editor Toolbar */}
                <div className="p-3 border-b border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Code2 className="size-4 text-primary" />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-background text-foreground text-xs rounded-lg px-2.5 py-1 border border-border font-mono cursor-pointer"
                    >
                      <option value="javascript">JavaScript (Node.js)</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python 3</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const starter =
                          currentQuestion.starterCode?.[selectedLanguage] || "";
                        handleCodeChange(starter);
                      }}
                      className="h-8 gap-1 text-xs cursor-pointer"
                    >
                      <RotateCcw className="size-3" />
                      <span>Reset</span>
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleRunCode}
                      disabled={runCodeMutation.isPending}
                      className="h-8 gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm"
                    >
                      {runCodeMutation.isPending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Play className="size-3" />
                      )}
                      <span>Run Code & Tests</span>
                    </Button>
                  </div>
                </div>

                {/* Editor Textarea with Syntax Theme */}
                <div className="relative flex-1 p-4 bg-slate-950 font-mono text-xs text-slate-200">
                  <textarea
                    value={currentCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    spellCheck={false}
                    className="w-full h-full min-h-[320px] bg-transparent text-slate-200 font-mono text-xs leading-relaxed outline-none resize-none"
                    placeholder="// Write your code solution here..."
                  />
                </div>
              </div>

              {/* Bottom Test Runner Console (POST /run-code) */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2.5">
                    <Terminal className="size-4 text-emerald-500" />
                    <span className="text-xs font-bold text-foreground">
                      Execution Console
                    </span>
                    {runResult && (
                      <Badge
                        variant="default"
                        className={cn(
                          "text-[10px] font-bold font-mono",
                          runResult.allPassed
                            ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-500 border-amber-500/30",
                        )}
                      >
                        {runResult.passedTestCases}/{runResult.totalTestCases}{" "}
                        Tests Passed
                      </Badge>
                    )}
                  </div>

                  {runResult && (
                    <div className="text-[11px] font-mono text-muted-foreground space-x-3">
                      <span>
                        Runtime:{" "}
                        <strong className="text-foreground">
                          {runResult.executionTimeMs || 32}ms
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Test results grid */}
                {runResult?.testCaseResults ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {runResult.testCaseResults.map((tc, i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-2.5 rounded-xl border text-xs font-mono space-y-1",
                          tc.passed
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-destructive/10 border-destructive/30 text-destructive",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">Test {i + 1}</span>
                          <span className="text-[9px] font-extrabold uppercase">
                            {tc.passed ? "PASSED" : "FAILED"}
                          </span>
                        </div>
                        {tc.error && (
                          <p className="text-[10px] truncate">{tc.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground font-mono">
                    Click &quot;Run Code &amp; Tests&quot; to execute your
                    solution against sample test cases.
                  </p>
                )}
              </div>
            </>
          ) : (
            /* MCQ Guide pane */
            <div className="rounded-2xl border border-border/80 bg-card/60 p-8 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
              <CheckCircle2 className="size-10 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                Multiple Choice Question Selected
              </h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Please select your answer from the options on the left pane.
                Your choice is instantly synchronized with the assessment
                server.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
        >
          <div className="rounded-3xl border border-border bg-card p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-foreground">
              Confirm Assessment Submission
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to finalize your assessment? Once submitted,
              your answers will be automatically graded and you cannot make
              further changes.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubmitModal(false)}
                className="text-xs cursor-pointer"
              >
                Continue Exam
              </Button>
              <Button
                size="sm"
                onClick={() => handleFinalSubmit(false)}
                disabled={submitExamMutation.isPending}
                className="text-xs font-bold gap-1.5 cursor-pointer bg-primary"
              >
                {submitExamMutation.isPending && (
                  <Loader2 className="size-3.5 animate-spin" />
                )}
                <span>Confirm &amp; Grade Exam</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
