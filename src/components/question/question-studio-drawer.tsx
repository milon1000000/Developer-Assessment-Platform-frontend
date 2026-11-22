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
import type {
  CreateGlobalQuestionPayload,
  IGlobalQuestion,
  McqOption,
  QuestionDifficulty,
  QuestionType,
  TestCase,
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

export const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript", runtime: "Node.js 20" },
  { id: "typescript", label: "TypeScript", runtime: "TS 5.x" },
  { id: "python", label: "Python", runtime: "Python 3.12" },
  { id: "cpp", label: "C++", runtime: "GCC 13" },
  { id: "java", label: "Java", runtime: "OpenJDK 21" },
] as const;

export type SupportedLang = (typeof SUPPORTED_LANGUAGES)[number]["id"];

export const DEFAULT_STARTER_CODES: Record<string, string> = {
  javascript: `function solution(args) {\n  // Write your code here\n  return null;\n}`,
  typescript: `function solution(args: any): any {\n  // Write your code here\n  return null;\n}`,
  python: `def solution(args):\n    # Write your code here\n    pass`,
  cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // Write your code here\n    }\n};`,
  java: `import java.util.*;\n\nclass Solution {\n    public Object solution(Object args) {\n        // Write your code here\n        return null;\n    }\n}`,
};

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
  const [tags, setTags] = React.useState<string[]>(["Algorithms"]);
  const [tagInput, setTagInput] = React.useState("");

  const [problemStatement, setProblemStatement] = React.useState("");
  const [constraints, setConstraints] = React.useState("");

  // Coding Specific
  const [activeLang, setActiveLang] =
    React.useState<SupportedLang>("javascript");
  const [starterCodes, setStarterCodes] = React.useState<
    Record<string, string>
  >(DEFAULT_STARTER_CODES);

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

  // Sync state when questionToEdit changes
  React.useEffect(() => {
    if (questionToEdit) {
      setType(questionToEdit.type || "CODING");
      setDifficulty(questionToEdit.difficulty || "EASY");
      setTitle(questionToEdit.title || "");
      setTags(questionToEdit.tags || []);
      setProblemStatement(questionToEdit.problemStatement || "");
      setConstraints(questionToEdit.constraints || "");

      const rawStarter = questionToEdit.starterCode as unknown;
      const initialStarter: Record<string, string> = {
        ...DEFAULT_STARTER_CODES,
      };
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

      // Determine active language: pick first configured or default to javascript
      const configuredLang =
        SUPPORTED_LANGUAGES.find(
          (l) =>
            rawStarter &&
            typeof rawStarter === "object" &&
            Boolean(
              (rawStarter as Record<string, unknown>)[l.id] &&
                String((rawStarter as Record<string, unknown>)[l.id]).trim(),
            ),
        )?.id || "javascript";
      setActiveLang(configuredLang);

      const normalizedTc = normalizeTestCases(questionToEdit.testCases);
      setTestCases(
        normalizedTc.length > 0
          ? normalizedTc
          : [
              {
                input: "nums = [2, 7, 11, 15], target = 9",
                output: "[0, 1]",
                isHidden: false,
                explanation:
                  "Because nums[0] + nums[1] == 9, we return [0, 1].",
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
    } else {
      // Reset form
      setType("CODING");
      setDifficulty("EASY");
      setTitle("");
      setTags(["Algorithms"]);
      setProblemStatement("");
      setConstraints("");
      setStarterCodes(DEFAULT_STARTER_CODES);
      setActiveLang("javascript");
      setTestCases([
        {
          input: "nums = [2, 7, 11, 15], target = 9",
          output: "[0, 1]",
          isHidden: false,
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
        },
      ]);
      setMcqOptions([
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
      ]);
      setCorrectOption("A");
    }
    setErrors({});
  }, [questionToEdit]);

  if (!isOpen) return null;

  // Add Tag
  const handleAddTag = () => {
    const clean = tagInput.trim();
    if (clean && !tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setTags([...tags, clean]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
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

    const payload: CreateGlobalQuestionPayload = {
      title: title.trim(),
      type,
      difficulty,
      tags,
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

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Close studio drawer"
      className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter") onClose();
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
            onClick={onClose}
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
                placeholder="Add tag (e.g. React, Array) and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
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
                onClick={handleAddTag}
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
              {/* Multi-Language Starter Code Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                      <Terminal className="size-3.5 text-primary" />
                      Starter Code Templates
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Configure boilerplate code across candidate-supported
                      languages
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono text-muted-foreground border-border/70 bg-muted/40"
                  >
                    {
                      SUPPORTED_LANGUAGES.find((l) => l.id === activeLang)
                        ?.runtime
                    }
                  </Badge>
                </div>

                {/* Language Switcher Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/70">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isActive = activeLang === lang.id;
                    const isConfigured = Boolean(starterCodes[lang.id]?.trim());
                    const isCustomized =
                      isConfigured &&
                      starterCodes[lang.id] !== DEFAULT_STARTER_CODES[lang.id];

                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setActiveLang(lang.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                        }`}
                      >
                        <span>{lang.label}</span>
                        {isConfigured && (
                          <span
                            className={`size-1.5 rounded-full ${
                              isActive
                                ? "bg-primary-foreground"
                                : isCustomized
                                  ? "bg-emerald-500"
                                  : "bg-muted-foreground/50"
                            }`}
                            title={
                              isCustomized
                                ? "Custom starter code configured"
                                : "Default boilerplate active"
                            }
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Editor Container */}
                <div className="rounded-xl border border-border/80 bg-zinc-950 overflow-hidden shadow-inner focus-within:ring-1 focus-within:ring-primary/50">
                  <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-zinc-800 bg-zinc-900/80 text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="size-3 text-primary" />
                      {
                        SUPPORTED_LANGUAGES.find((l) => l.id === activeLang)
                          ?.label
                      }{" "}
                      Boilerplate
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setStarterCodes((prev) => ({
                          ...prev,
                          [activeLang]: DEFAULT_STARTER_CODES[activeLang] || "",
                        }));
                        toast.info(
                          `Reset ${SUPPORTED_LANGUAGES.find((l) => l.id === activeLang)?.label} to default boilerplate`,
                        );
                      }}
                      className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="size-2.5" />
                      Reset to Default
                    </button>
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
                    placeholder={`// Write starter code template for ${
                      SUPPORTED_LANGUAGES.find((l) => l.id === activeLang)
                        ?.label
                    }...`}
                    className="font-mono text-xs bg-transparent border-0 text-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0 resize-y p-3.5 leading-relaxed rounded-none"
                  />
                </div>
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
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
        </form>
      </div>
    </div>
  );
}
