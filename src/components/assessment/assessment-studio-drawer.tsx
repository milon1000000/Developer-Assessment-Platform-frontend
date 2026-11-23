"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateAssessment,
  useUpdateAssessment,
} from "@/app/hooks/assessment.hooks";
import { useGlobalQuestions } from "@/app/hooks/question.hooks";
import type {
  IAssessment,
  IAssessmentQuestionInput,
  ICreateAssessmentPayload,
} from "@/types/assessment.type";
import type { IGlobalQuestion } from "@/types/question.type";
import {
  createAssessmentSchema,
  updateAssessmentSchema,
} from "@/validations/assessment.validation";
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  HelpCircle,
  Layers,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface AssessmentStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentToEdit?: IAssessment | null;
}

export function AssessmentStudioDrawer({
  isOpen,
  onClose,
  assessmentToEdit,
}: AssessmentStudioDrawerProps) {
  const isEditMode = Boolean(assessmentToEdit);

  // Form states
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [durationMinutes, setDurationMinutes] = React.useState(60);
  const [passingScore, setPassingScore] = React.useState(60);
  const [maxTabSwitches, setMaxTabSwitches] = React.useState(3);
  const [expiresAt, setExpiresAt] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  // Attached questions state
  const [attachedQuestions, setAttachedQuestions] = React.useState<
    IAssessmentQuestionInput[]
  >([]);

  // Question Bank Picker state
  const [isQuestionBankOpen, setIsQuestionBankOpen] = React.useState(false);
  const [bankSearch, setBankSearch] = React.useState("");
  const [bankType, setBankType] = React.useState<"ALL" | "CODING" | "MCQ">(
    "ALL",
  );

  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const createMutation = useCreateAssessment();
  const updateMutation = useUpdateAssessment();

  // Fetch questions from Global Question Bank
  const { data: globalQuestionsData, isLoading: isLoadingBank } =
    useGlobalQuestions({
      search: bankSearch || undefined,
      type: bankType,
      limit: 20,
    });

  const availableBankQuestions = globalQuestionsData?.data || [];

  const resetForm = React.useCallback(() => {
    setTitle("");
    setDescription("");
    setDurationMinutes(60);
    setPassingScore(60);
    setMaxTabSwitches(3);
    setExpiresAt("");
    setIsActive(true);
    setAttachedQuestions([]);
    setIsQuestionBankOpen(false);
    setBankSearch("");
    setBankType("ALL");
    setErrors({});
  }, []);

  // Sync state on opening or editing
  React.useEffect(() => {
    if (!isOpen) return;

    if (assessmentToEdit) {
      setTitle(assessmentToEdit.title || "");
      setDescription(assessmentToEdit.description || "");
      setDurationMinutes(assessmentToEdit.durationMinutes || 60);
      setPassingScore(assessmentToEdit.passingScore || 60);
      setMaxTabSwitches(assessmentToEdit.maxTabSwitches ?? 3);
      setExpiresAt(
        assessmentToEdit.expiresAt
          ? new Date(assessmentToEdit.expiresAt).toISOString().split("T")[0]
          : "",
      );
      setIsActive(assessmentToEdit.isActive ?? true);

      if (assessmentToEdit.questions) {
        setAttachedQuestions(
          assessmentToEdit.questions.map((q, idx) => ({
            globalQuestionId: q.globalQuestionId || undefined,
            title: q.title,
            type: q.type,
            difficulty: q.difficulty,
            problemStatement: q.problemStatement,
            constraints: q.constraints || undefined,
            starterCode: q.starterCode || undefined,
            testCases: q.testCases || undefined,
            mcqOptions: q.mcqOptions || undefined,
            correctOption: q.correctOption || undefined,
            points: q.points || 10,
            orderIndex: q.orderIndex ?? idx,
          })),
        );
      }
      setErrors({});
    } else {
      resetForm();
    }
  }, [assessmentToEdit, isOpen, resetForm]);

  // Add question from global bank
  const handleAddFromBank = (gq: IGlobalQuestion) => {
    const isAlreadyAdded = attachedQuestions.some(
      (q) => q.globalQuestionId === gq.id,
    );

    if (isAlreadyAdded) {
      toast.info("Already Attached", {
        description: `"${gq.title}" is already in this assessment.`,
      });
      return;
    }

    const newQuestion: IAssessmentQuestionInput = {
      globalQuestionId: gq.id,
      title: gq.title,
      type: gq.type,
      difficulty: gq.difficulty,
      problemStatement: gq.problemStatement,
      constraints: gq.constraints || undefined,
      starterCode: gq.starterCode ? (gq.starterCode as any) : undefined,
      testCases: gq.testCases ? (gq.testCases as any) : undefined,
      mcqOptions: gq.mcqOptions ? (gq.mcqOptions as any) : undefined,
      correctOption: gq.correctOption || undefined,
      points:
        gq.difficulty === "HARD" ? 30 : gq.difficulty === "MEDIUM" ? 20 : 10,
      orderIndex: attachedQuestions.length,
    };

    setAttachedQuestions((prev) => [...prev, newQuestion]);
    toast.success("Question Attached", {
      description: `"${gq.title}" added to assessment questions.`,
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setAttachedQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdatePoints = (index: number, points: number) => {
    setAttachedQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, points } : q)),
    );
  };

  const totalPoints = attachedQuestions.reduce(
    (sum, q) => sum + (Number(q.points) || 0),
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: ICreateAssessmentPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      durationMinutes: Number(durationMinutes) || 60,
      passingScore: Number(passingScore) || 60,
      maxTabSwitches: Number(maxTabSwitches) || 3,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      questions: attachedQuestions.map((q, idx) => ({
        ...q,
        orderIndex: idx,
      })),
    };

    // Client Validation
    const validation = isEditMode
      ? updateAssessmentSchema.safeParse(payload)
      : createAssessmentSchema.safeParse(payload);

    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      setErrors(fieldErrors);
      const firstError =
        validation.error.issues[0]?.message || "Please fix validation errors.";
      toast.error("Validation Error", { description: firstError });
      return;
    }

    try {
      if (isEditMode && assessmentToEdit) {
        await updateMutation.mutateAsync({
          id: assessmentToEdit.id,
          payload: {
            ...payload,
            isActive,
          },
        });
        toast.success("Assessment Updated!", {
          description: `"${title}" has been successfully updated.`,
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Assessment Created!", {
          description: `"${title}" has been published to your assessments hub.`,
        });
        resetForm();
      }
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (
          err as {
            message?: string;
            response?: { _data?: { message?: string } };
          }
        )?.response?._data?.message ||
        (err as Error)?.message ||
        "Operation failed. Please try again.";
      toast.error("Error", { description: errorMsg });
      setErrors({ form: errorMsg });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative flex h-full w-full max-w-3xl flex-col border-l border-border bg-card shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/20">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <h2 className="text-base font-bold text-foreground">
                {isEditMode
                  ? "Edit Assessment Studio"
                  : "Create New Assessment"}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure parameters, anti-cheat limits, and attach questions from
              the Global Question Bank.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isEditMode && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                title="Reset Form"
              >
                <RotateCcw className="size-3" />
                Reset
              </Button>
            )}
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
        </div>

        {/* Scrollable Form Body */}
        <form
          id="assessment-studio-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {errors.form && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Section 1: Basic Specifications */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              1. Assessment Specifications
            </h3>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="assessment-title">Assessment Title *</Label>
              <Input
                id="assessment-title"
                placeholder="e.g. Senior Full-Stack Screening (React & Node.js)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={Boolean(errors.title)}
                className="text-xs h-9"
              />
              {errors.title && (
                <p className="text-[11px] text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="assessment-desc">
                Description / Instructions
              </Label>
              <Textarea
                id="assessment-desc"
                rows={2}
                placeholder="Provide test instructions, environment requirements, or target role summary..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Duration, Passing Score, Expiry */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor="assessment-duration"
                  className="text-xs flex items-center gap-1"
                >
                  <Clock className="size-3 text-primary" />
                  Duration (Mins) *
                </Label>
                <Input
                  id="assessment-duration"
                  type="number"
                  min={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="text-xs h-9 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="assessment-pass"
                  className="text-xs flex items-center gap-1"
                >
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  Passing Score (%) *
                </Label>
                <Input
                  id="assessment-pass"
                  type="number"
                  min={0}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="text-xs h-9 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="assessment-expiry" className="text-xs">
                  Expiry Date (Optional)
                </Label>
                <Input
                  id="assessment-expiry"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            {/* Anti-Cheat Proctoring Rules */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                  <Shield className="size-4" />
                  Anti-Cheat & Proctoring Rules
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] border-amber-500/40 text-amber-500 font-bold"
                >
                  Enforced
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Candidates navigating away from the active browser tab or exam
                window will receive instant warnings and violations are logged.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-foreground">
                  Max Tab Switches Allowed:
                </span>
                <select
                  value={maxTabSwitches}
                  onChange={(e) => setMaxTabSwitches(Number(e.target.value))}
                  className="rounded-lg border border-amber-500/30 bg-background px-3 py-1 text-xs font-bold text-foreground focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value={1}>1 Switch (Strict)</option>
                  <option value={3}>3 Switches (Recommended)</option>
                  <option value={5}>5 Switches (Relaxed)</option>
                  <option value={10}>10 Switches</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Attached Questions & Question Bank Integration */}
          <div className="space-y-4 pt-4 border-t border-border/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Code2 className="size-3.5 text-primary" />
                  2. Assessment Questions ({attachedQuestions.length})
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Total Marks:{" "}
                  <span className="font-bold text-emerald-500">
                    {totalPoints} pts
                  </span>
                </p>
              </div>

              <Button
                type="button"
                variant={isQuestionBankOpen ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsQuestionBankOpen(!isQuestionBankOpen)}
                className="h-8 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer self-start sm:self-auto"
              >
                <BookOpen className="size-3.5" />
                {isQuestionBankOpen
                  ? "Close Question Bank"
                  : "+ Pick from Question Bank"}
              </Button>
            </div>

            {/* Expandable Question Bank Selector Panel */}
            {isQuestionBankOpen && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3 animate-in fade-in-0 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      Global Question Bank Selector
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Click to attach questions to this assessment
                  </span>
                </div>

                {/* Search & Filter within Question Bank */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search question bank..."
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      className="h-8 text-xs pl-8"
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant={bankType === "ALL" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBankType("ALL")}
                      className="h-8 text-xs px-2.5"
                    >
                      All
                    </Button>
                    <Button
                      type="button"
                      variant={bankType === "CODING" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBankType("CODING")}
                      className="h-8 text-xs px-2.5"
                    >
                      Coding
                    </Button>
                    <Button
                      type="button"
                      variant={bankType === "MCQ" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setBankType("MCQ")}
                      className="h-8 text-xs px-2.5"
                    >
                      MCQ
                    </Button>
                  </div>
                </div>

                {/* Available Questions List */}
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {isLoadingBank ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      <Loader2 className="size-4 animate-spin mx-auto mb-1 text-primary" />
                      Loading global questions...
                    </div>
                  ) : availableBankQuestions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No matching questions found in Global Question Bank.
                    </div>
                  ) : (
                    availableBankQuestions.map((gq) => {
                      const isAdded = attachedQuestions.some(
                        (q) => q.globalQuestionId === gq.id,
                      );
                      return (
                        <div
                          key={gq.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/80 p-2.5 transition-all hover:border-primary/40"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-foreground truncate">
                                {gq.title}
                              </span>
                              <Badge
                                variant={
                                  gq.type === "CODING" ? "default" : "secondary"
                                }
                                className="text-[9px] uppercase font-bold"
                              >
                                {gq.type}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-[9px] font-bold"
                              >
                                {gq.difficulty}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {gq.problemStatement}
                            </p>
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant={isAdded ? "secondary" : "default"}
                            disabled={isAdded}
                            onClick={() => handleAddFromBank(gq)}
                            className="h-7 text-xs font-semibold px-2.5 shrink-0 gap-1 cursor-pointer"
                          >
                            {isAdded ? (
                              <>
                                <Check className="size-3 text-emerald-500" />
                                Added
                              </>
                            ) : (
                              <>
                                <Plus className="size-3" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* List of Attached Questions */}
            {attachedQuestions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground bg-muted/10">
                <Code2 className="size-5 text-muted-foreground mx-auto mb-1.5" />
                <p className="font-semibold text-foreground">
                  No questions attached yet
                </p>
                <p className="text-[11px] mt-0.5">
                  Click "+ Pick from Question Bank" above to attach coding
                  challenges and MCQs.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {attachedQuestions.map((q, idx) => (
                  <div
                    key={`attached-q-${idx}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/60 p-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-foreground truncate">
                            {q.title}
                          </span>
                          <Badge
                            variant={
                              q.type === "CODING" ? "default" : "secondary"
                            }
                            className="text-[9px] uppercase font-bold"
                          >
                            {q.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[9px] font-bold"
                          >
                            {q.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          Pts:
                        </span>
                        <Input
                          type="number"
                          min={1}
                          value={q.points}
                          onChange={(e) =>
                            handleUpdatePoints(idx, Number(e.target.value))
                          }
                          className="w-16 h-7 text-xs font-bold text-center"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Remove Question"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/80 px-6 py-4 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-9 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="assessment-studio-form"
            size="sm"
            disabled={isPending}
            className="text-xs h-9 font-bold px-5 gap-1.5 shadow-md cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                {isEditMode ? "Saving Changes..." : "Publishing Assessment..."}
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                {isEditMode ? "Save Changes" : "Publish Assessment"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
