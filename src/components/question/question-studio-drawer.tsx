"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useCreateGlobalQuestion,
  useUpdateGlobalQuestion,
} from "@/app/hooks/question.hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type CreateGlobalQuestionPayload,
  type IGlobalQuestion,
  type McqOption,
  POPULAR_LANGUAGE_SUGGESTIONS,
  type QuestionDifficulty,
  type QuestionType,
  type TestCase,
  getLanguageInfo,
} from "@/types/question.type";
import {
  createQuestionSchema,
  updateQuestionSchema,
} from "@/validations/question.validation";
import {
  AlertCircle,
  Check,
  Code2,
  HelpCircle,
  Loader2,
  Lock,
  Plus,
  RotateCcw,
  Sparkles,
  Terminal,
  Trash2,
  X,
} from "lucide-react";

interface QuestionStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  questionToEdit?: IGlobalQuestion | null;
}

function normalizeMcqOptions(
  options: unknown,
): Array<{ id: string; text: string }> {
  if (!options) return [];

  if (Array.isArray(options)) {
    return options.map((item, index) => {
      if (typeof item === "string") {
        return {
          id: String.fromCharCode(65 + index),
          text: item,
        };
      }
      if (item && typeof item === "object") {
        const anyItem = item as {
          id?: string;
          text?: string;
          option?: string;
          value?: string;
        };
        const id = anyItem.id || String.fromCharCode(65 + index);
        const text =
          anyItem.text || anyItem.option || anyItem.value || String(item);
        return { id, text };
      }
      return { id: String.fromCharCode(65 + index), text: String(item) };
    });
  }

  if (typeof options === "object") {
    return Object.entries(options as Record<string, unknown>).map(
      ([key, val]) => ({
        id: key,
        text: typeof val === "string" ? val : JSON.stringify(val),
      }),
    );
  }

  return [];
}

function normalizeTestCases(testCases: unknown): Array<{
  input: string;
  output: string;
  isHidden: boolean;
  explanation?: string;
}> {
  if (!Array.isArray(testCases)) return [];
  return testCases.map((tc) => {
    if (typeof tc === "string") {
      return { input: tc, output: "", isHidden: false };
    }
    const anyTc = tc as {
      input?: unknown;
      output?: unknown;
      expectedOutput?: unknown;
      isHidden?: unknown;
      explanation?: unknown;
    };
    const rawOut = anyTc.output ?? anyTc.expectedOutput;
    const output =
      typeof rawOut === "string" ? rawOut : JSON.stringify(rawOut ?? "");
    const rawIn = anyTc.input;
    const input =
      typeof rawIn === "string" ? rawIn : JSON.stringify(rawIn ?? "");

    return {
      input,
      output,
      isHidden: Boolean(anyTc.isHidden),
      explanation: anyTc.explanation ? String(anyTc.explanation) : undefined,
    };
  });
}

export function QuestionStudioDrawer({
  isOpen,
  onClose,
  questionToEdit,
}: QuestionStudioDrawerProps) {
  const isEditMode = Boolean(questionToEdit);

  const createMutation = useCreateGlobalQuestion();
  const updateMutation = useUpdateGlobalQuestion();

  // Form State
  const [type, setType] = React.useState<QuestionType>("CODING");
  const [difficulty, setDifficulty] =
    React.useState<QuestionDifficulty>("EASY");
  const [title, setTitle] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");

  const [problemStatement, setProblemStatement] = React.useState("");
  const [constraints, setConstraints] = React.useState("");

  // Coding Specific: Dynamic Multi-Language Starter Code
  const [activeLang, setActiveLang] = React.useState<string>("javascript");
  const [starterCodes, setStarterCodes] = React.useState<
    Record<string, string>
  >({
    javascript: getLanguageInfo("javascript").template,
  });
  const [newLangInput, setNewLangInput] = React.useState("");

  const [testCases, setTestCases] = React.useState<TestCase[]>([
    {
      input: "nums = [2, 7, 11, 15], target = 9",
      output: "[0, 1]",
      isHidden: false,
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
  ]);

  // MCQ Specific
  const [mcqOptions, setMcqOptions] = React.useState<McqOption[]>([
    { id: "A", text: "" },
    { id: "B", text: "" },
    { id: "C", text: "" },
    { id: "D", text: "" },
  ]);
  const [correctOption, setCorrectOption] = React.useState("A");

  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  // Reset all form fields to blank initial state
  const resetForm = React.useCallback(() => {
    setType("CODING");
    setDifficulty("EASY");
    setTitle("");
    setTags([]);
    setTagInput("");
    setProblemStatement("");
    setConstraints("");
    setStarterCodes({
      javascript: getLanguageInfo("javascript").template,
    });
    setActiveLang("javascript");
    setNewLangInput("");
    setTestCases([
      {
        input: "",
        output: "",
        isHidden: false,
        explanation: "",
      },
    ]);
    setMcqOptions([
      { id: "A", text: "" },
      { id: "B", text: "" },
      { id: "C", text: "" },
      { id: "D", text: "" },
    ]);
    setCorrectOption("A");
    setErrors({});
  }, []);

  // Sync state when questionToEdit or isOpen changes
  React.useEffect(() => {
    if (!isOpen) return;

    if (questionToEdit) {
      setType(questionToEdit.type || "CODING");
      setDifficulty(questionToEdit.difficulty || "EASY");
      setTitle(questionToEdit.title || "");
      setTags(questionToEdit.tags || []);
      setTagInput("");
      setProblemStatement(questionToEdit.problemStatement || "");
      setConstraints(questionToEdit.constraints || "");

      const rawStarter = questionToEdit.starterCode as unknown;
      const initialStarter: Record<string, string> = {};
      if (rawStarter && typeof rawStarter === "object") {
        Object.entries(rawStarter as Record<string, unknown>).forEach(
          ([key, val]) => {
            if (typeof val === "string") {
              initialStarter[key.toLowerCase()] = val;
            }
          },
        );
      } else if (typeof rawStarter === "string" && rawStarter.trim()) {
        initialStarter.javascript = rawStarter;
      }
      setStarterCodes(initialStarter);

      const langs = Object.keys(initialStarter);
      setActiveLang(langs.length > 0 ? langs[0] : "");
      setNewLangInput("");

      const normalizedTc = normalizeTestCases(questionToEdit.testCases);
      setTestCases(
        normalizedTc.length > 0
          ? normalizedTc
          : [
              {
                input: "",
                output: "",
                isHidden: false,
              },
            ],
      );

      const normalizedOpts = normalizeMcqOptions(questionToEdit.mcqOptions);
      setMcqOptions(
        normalizedOpts.length > 0
          ? normalizedOpts
          : [
              { id: "A", text: "" },
              { id: "B", text: "" },
              { id: "C", text: "" },
              { id: "D", text: "" },
            ],
      );

      setCorrectOption(questionToEdit.correctOption || "A");
      setErrors({});
    } else {
      resetForm();
    }
  }, [questionToEdit, isOpen, resetForm]);

  if (!isOpen) return null;

  // Add Tag (Splits comma/semicolon separated values into individual tags)
  const handleAddTag = (rawInput?: unknown) => {
    const raw = (typeof rawInput === "string" ? rawInput : tagInput).trim();
    if (!raw) return;

    const parts = raw
      .split(/[,;]+/)
      .map((t) => t.trim().replace(/^#+/, ""))
      .filter((t) => t.length > 0);

    const updated = [...tags];
    for (const part of parts) {
      if (!updated.some((t) => t.toLowerCase() === part.toLowerCase())) {
        updated.push(part);
      }
    }

    setTags(updated);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Dynamic Starter Code Language Handlers
  const handleAddLanguage = (langName: string) => {
    const clean = langName.trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    const info = getLanguageInfo(clean);

    if (starterCodes[key] !== undefined) {
      toast.info(`Language "${info.label}" is already added.`);
      setActiveLang(key);
      setNewLangInput("");
      return;
    }

    setStarterCodes((prev) => ({
      ...prev,
      [key]: info.template,
    }));
    setActiveLang(key);
    setNewLangInput("");
    toast.success(`Added ${info.label} starter template`);
  };

  const handleRemoveLanguage = (langKey: string) => {
    const info = getLanguageInfo(langKey);
    const updated = { ...starterCodes };
    delete updated[langKey];
    setStarterCodes(updated);

    if (activeLang === langKey) {
      const remaining = Object.keys(updated);
      setActiveLang(remaining.length > 0 ? remaining[0] : "");
    }
    toast.info(`Removed ${info.label} starter code`);
  };

  const handleResetLanguage = (langKey: string) => {
    const info = getLanguageInfo(langKey);
    setStarterCodes((prev) => ({
      ...prev,
      [langKey]: info.template,
    }));
    toast.info(`Reset ${info.label} boilerplate to default`);
  };

  // Dynamic Test Case Handlers
  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      {
        input: "",
        output: "",
        isHidden: false,
      },
    ]);
  };

  const handleRemoveTestCase = (index: number) => {
    if (testCases.length <= 1) {
      toast.error("At least one testcase is required.");
      return;
    }
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (
    index: number,
    field: keyof TestCase,
    value: string | boolean,
  ) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  // Dynamic MCQ Option Handlers
  const handleOptionChange = (id: string, text: string) => {
    setMcqOptions(
      mcqOptions.map((opt) => (opt.id === id ? { ...opt, text } : opt)),
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Filter test cases: if user added blank rows at the end, clean them up
    const cleanedTc =
      type === "CODING"
        ? testCases
            .map((tc) => ({
              ...tc,
              input: String(tc.input ?? "").trim(),
              output: String(tc.output ?? "").trim(),
            }))
            .filter((tc, idx) => idx === 0 || tc.input || tc.output)
        : undefined;

    // Filter mcq options
    const cleanedMcq =
      type === "MCQ"
        ? mcqOptions.map((opt) => ({
            ...opt,
            text: String(opt.text ?? "").trim(),
          }))
        : undefined;

    // Filter starter codes: only keep non-empty entries
    const cleanedStarterCode: Record<string, string> = {};
    Object.entries(starterCodes).forEach(([lang, code]) => {
      if (typeof code === "string" && code.trim()) {
        cleanedStarterCode[lang] = code;
      }
    });

    // Sanitize tags: ensure every tag is an individual trimmed string without commas or hashes
    const cleanedTags: string[] = [];
    tags.forEach((tag) => {
      tag
        .split(/[,;]+/)
        .map((t) => t.trim().replace(/^#+/, ""))
        .filter((t) => t.length > 0)
        .forEach((cleanTag) => {
          if (
            !cleanedTags.some((c) => c.toLowerCase() === cleanTag.toLowerCase())
          ) {
            cleanedTags.push(cleanTag);
          }
        });
    });

    const payload: CreateGlobalQuestionPayload = {
      title: title.trim(),
      type,
      difficulty,
      tags: cleanedTags,
      problemStatement: problemStatement.trim(),
      constraints: constraints?.trim() || undefined,
      starterCode: type === "CODING" ? cleanedStarterCode : undefined,
      testCases: cleanedTc,
      mcqOptions: cleanedMcq,
      correctOption: type === "MCQ" ? correctOption : undefined,
    };

    // Client Validation
    const validation = isEditMode
      ? updateQuestionSchema.safeParse(payload)
      : createQuestionSchema.safeParse(payload);

    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      setErrors(fieldErrors);
      const firstError =
        validation.error.issues[0]?.message ||
        "Please fix the form errors before submitting.";
      toast.error("Validation Error", {
        description: firstError,
      });
      return;
    }

    try {
      if (isEditMode && questionToEdit) {
        await updateMutation.mutateAsync({
          id: questionToEdit.id,
          payload,
        });
        toast.success("Question Updated!", {
          description: `"${title}" has been successfully updated.`,
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Question Created!", {
          description: `"${title}" has been added to the Global Question Bank.`,
        });
        resetForm();
      }
      onClose();
    } catch (err: unknown) {
      const errorResponse = err as {
        response?: { _data?: { message?: string } };
        data?: { message?: string };
        message?: string;
      };
      const errorMsg =
        errorResponse?.response?._data?.message ||
        errorResponse?.data?.message ||
        errorResponse?.message ||
        "Operation failed. Please try again.";

      toast.error("Error", { description: errorMsg });
      setErrors({ form: errorMsg });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    if (!isEditMode) {
      resetForm();
    }
    onClose();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Close studio drawer"
      className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm"
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter") handleClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Question Studio"
        className="relative flex h-full w-full max-w-2xl flex-col border-l border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border/70 p-5 bg-card/90">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span>
                {isEditMode
                  ? "Edit Global Question"
                  : "Create New Global Question"}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Define problem specifications, difficulty, code starter & test
              cases.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-sm"
        >
          {errors.form && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Type Switcher Tabs */}
          <div className="space-y-1.5">
            <Label>Question Type</Label>
            <div className="flex rounded-lg border border-border p-1 bg-background">
              <button
                type="button"
                onClick={() => setType("CODING")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  type === "CODING"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="size-3.5" />
                <span>Coding Challenge</span>
              </button>
              <button
                type="button"
                onClick={() => setType("MCQ")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  type === "MCQ"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <HelpCircle className="size-3.5" />
                <span>Multiple Choice Quiz (MCQ)</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="question-title">Title *</Label>
            <Input
              id="question-title"
              placeholder="e.g. Reverse Linked List, Two Sum, React Fiber Concept"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={Boolean(errors.title)}
            />
            {errors.title && (
              <p className="text-[11px] text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Difficulty Segmented Selector */}
          <div className="space-y-1.5">
            <Label>Difficulty Level</Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  {
                    id: "EASY",
                    label: "Easy",
                    color: "hover:border-emerald-500/50",
                  },
                  {
                    id: "MEDIUM",
                    label: "Medium",
                    color: "hover:border-amber-500/50",
                  },
                  {
                    id: "HARD",
                    label: "Hard",
                    color: "hover:border-rose-500/50",
                  },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={`rounded-lg border p-2 text-xs font-bold transition-all cursor-pointer ${
                    difficulty === d.id
                      ? d.id === "EASY"
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40"
                        : d.id === "MEDIUM"
                          ? "border-amber-500 bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/40"
                          : "border-rose-500 bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/40"
                      : "border-border bg-background/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Domain Tags Input */}
          <div className="space-y-1.5">
            <Label>Skill & Domain Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tags (e.g. Array, Hash Table) and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData("text");
                  if (
                    pasted &&
                    (pasted.includes(",") || pasted.includes(";"))
                  ) {
                    e.preventDefault();
                    handleAddTag(pasted);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="text-xs"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddTag()}
                className="shrink-0 text-xs gap-1"
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 px-2 py-0.5 text-[11px] font-semibold"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted-foreground hover:text-foreground ml-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Problem Statement */}
          <div className="space-y-1.5">
            <Label htmlFor="problem-statement">
              Problem Statement (Markdown Supported) *
            </Label>
            <Textarea
              id="problem-statement"
              rows={5}
              placeholder="Describe the challenge in detail, including inputs, expected return values, and edge cases..."
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              error={Boolean(errors.problemStatement)}
              className="font-sans text-xs sm:text-sm"
            />
            {errors.problemStatement && (
              <p className="text-[11px] text-destructive">
                {errors.problemStatement}
              </p>
            )}
          </div>

          {/* Constraints */}
          <div className="space-y-1.5">
            <Label htmlFor="constraints">Constraints & Edge Cases</Label>
            <Textarea
              id="constraints"
              rows={2}
              placeholder="e.g. 1 <= nums.length <= 10^5, -10^9 <= nums[i] <= 10^9"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          {/* CONDITIONAL: CODING MODE */}
          {type === "CODING" && (
            <div className="space-y-5 pt-3 border-t border-border/70">
              {/* Dynamic Multi-Language Starter Code Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <Label className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                      <Terminal className="size-3.5 text-primary" />
                      Starter Code Templates ({Object.keys(starterCodes).length}
                      )
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Add any programming language you want candidates to solve
                      this problem in
                    </p>
                  </div>
                  {activeLang && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono text-muted-foreground border-border/70 bg-muted/40 self-start sm:self-auto"
                    >
                      {getLanguageInfo(activeLang).runtime}
                    </Badge>
                  )}
                </div>

                {/* Add Language Bar & Quick Suggestions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Add language (e.g. Python, Go, Rust, PHP, C#)..."
                        value={newLangInput}
                        onChange={(e) => setNewLangInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddLanguage(newLangInput);
                          }
                        }}
                        list="available-languages-list"
                        className="text-xs h-8"
                      />
                      <datalist id="available-languages-list">
                        {POPULAR_LANGUAGE_SUGGESTIONS.map((k) => (
                          <option key={k} value={getLanguageInfo(k).label} />
                        ))}
                      </datalist>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddLanguage(newLangInput)}
                      className="h-8 text-xs gap-1 shrink-0 border-primary/40 text-primary hover:bg-primary/10"
                    >
                      <Plus className="size-3" />
                      Add Language
                    </Button>
                  </div>

                  {/* Quick-add chips for unadded popular languages */}
                  {POPULAR_LANGUAGE_SUGGESTIONS.filter(
                    (k) => starterCodes[k] === undefined,
                  ).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Quick add:
                      </span>
                      {POPULAR_LANGUAGE_SUGGESTIONS.filter(
                        (k) => starterCodes[k] === undefined,
                      )
                        .slice(0, 6)
                        .map((k) => {
                          const info = getLanguageInfo(k);
                          return (
                            <button
                              key={k}
                              type="button"
                              onClick={() => handleAddLanguage(k)}
                              className="px-2 py-0.5 text-[10px] rounded-md border border-border/70 bg-background/80 hover:bg-muted/80 text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="size-2.5" />
                              {info.label}
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Language Tabs List or Empty State */}
                {Object.keys(starterCodes).length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/80 p-5 text-center bg-muted/20">
                    <Terminal className="size-5 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-foreground">
                      No starter code languages added
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Type any language above or click a quick suggestion to add
                      starter templates for candidates.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Active Language Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/70">
                      {Object.keys(starterCodes).map((langKey) => {
                        const isActive = activeLang === langKey;
                        const info = getLanguageInfo(langKey);
                        const hasCode = Boolean(starterCodes[langKey]?.trim());

                        return (
                          <div
                            key={langKey}
                            onClick={() => setActiveLang(langKey)}
                            className={`flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                            }`}
                          >
                            <span>{info.label}</span>
                            {hasCode && (
                              <span
                                className={`size-1.5 rounded-full ${
                                  isActive
                                    ? "bg-primary-foreground"
                                    : "bg-emerald-500"
                                }`}
                              />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveLanguage(langKey);
                              }}
                              className={`p-0.5 rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors ml-0.5 cursor-pointer ${
                                isActive
                                  ? "text-primary-foreground/80 hover:text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                              title={`Remove ${info.label}`}
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Editor Container for Active Language */}
                    {activeLang && starterCodes[activeLang] !== undefined && (
                      <div className="rounded-xl border border-border/80 bg-zinc-950 overflow-hidden shadow-inner focus-within:ring-1 focus-within:ring-primary/50">
                        <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-zinc-800 bg-zinc-900/80 text-[11px] font-mono text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <Code2 className="size-3 text-primary" />
                            {getLanguageInfo(activeLang).label} Boilerplate
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleResetLanguage(activeLang)}
                              className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="size-2.5" />
                              Reset Default
                            </button>
                            <span className="text-zinc-700">|</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveLanguage(activeLang)}
                              className="flex items-center gap-1 text-[10px] text-rose-400/80 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="size-2.5" />
                              Remove
                            </button>
                          </div>
                        </div>
                        <Textarea
                          rows={6}
                          value={starterCodes[activeLang] || ""}
                          onChange={(e) =>
                            setStarterCodes((prev) => ({
                              ...prev,
                              [activeLang]: e.target.value,
                            }))
                          }
                          placeholder={`// Write starter code template for ${getLanguageInfo(activeLang).label}...`}
                          className="font-mono text-xs bg-transparent border-0 text-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 resize-y p-3.5 leading-relaxed rounded-none"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Dynamic Test Cases Builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Test Cases *</Label>
                    <p className="text-[11px] text-muted-foreground">
                      Public samples vs hidden automated grading tests
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTestCase}
                    className="h-7 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <Plus className="size-3" />
                    Add Test Case
                  </Button>
                </div>

                {errors.testCases && (
                  <p className="text-[11px] text-destructive font-medium">
                    {errors.testCases}
                  </p>
                )}

                <div className="space-y-3">
                  {testCases.map((tc, index) => (
                    <div
                      key={`testcase-row-${index}`}
                      className="rounded-xl border border-border/80 bg-background/60 p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          Test Case #{index + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(tc.isHidden)}
                              onChange={(e) =>
                                handleTestCaseChange(
                                  index,
                                  "isHidden",
                                  e.target.checked,
                                )
                              }
                              className="rounded border-border text-primary focus:ring-primary size-3.5"
                            />
                            <span className="flex items-center gap-1 font-semibold">
                              <Lock className="size-2.5 text-amber-500" />
                              Hidden
                            </span>
                          </label>

                          {testCases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTestCase(index)}
                              className="text-muted-foreground hover:text-destructive p-1 cursor-pointer"
                              title="Delete Test Case"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">
                            Input *
                          </span>
                          <Textarea
                            rows={2}
                            placeholder="e.g. nums = [2, 7], target = 9"
                            value={tc.input}
                            onChange={(e) =>
                              handleTestCaseChange(
                                index,
                                "input",
                                e.target.value,
                              )
                            }
                            className="font-mono text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">
                            Expected Output *
                          </span>
                          <Textarea
                            rows={2}
                            placeholder="e.g. [0, 1]"
                            value={tc.output}
                            onChange={(e) =>
                              handleTestCaseChange(
                                index,
                                "output",
                                e.target.value,
                              )
                            }
                            className="font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONDITIONAL: MCQ MODE */}
          {type === "MCQ" && (
            <div className="space-y-4 pt-3 border-t border-border/70">
              <div>
                <Label>MCQ Options & Correct Answer *</Label>
                <p className="text-[11px] text-muted-foreground">
                  Select the radio button next to the correct answer.
                </p>
              </div>

              {errors.correctOption && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.correctOption}
                </p>
              )}

              <div className="space-y-2.5">
                {mcqOptions.map((opt, optIndex) => {
                  const optionId = opt.id || String.fromCharCode(65 + optIndex);
                  const isChecked =
                    correctOption === optionId || correctOption === opt.text;
                  return (
                    <div
                      key={`studio-opt-${optionId}-${optIndex}`}
                      className={`flex items-center gap-3 rounded-xl border p-2.5 transition-all ${
                        isChecked
                          ? "border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/30"
                          : "border-border/70 bg-background/60"
                      }`}
                    >
                      <input
                        type="radio"
                        id={`option-${optionId}`}
                        name="correct-option"
                        checked={isChecked}
                        onChange={() => setCorrectOption(optionId)}
                        className="size-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold font-mono text-muted-foreground">
                        {optionId}
                      </span>
                      <Input
                        value={opt.text}
                        onChange={(e) =>
                          handleOptionChange(optionId, e.target.value)
                        }
                        placeholder={`Option ${optionId} text...`}
                        className="flex-1 text-xs h-8.5"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border/70">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              Reset Form
            </Button>
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="gap-2 font-semibold bg-primary text-white cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    <span>
                      {isEditMode ? "Update Question" : "Create Question"}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
