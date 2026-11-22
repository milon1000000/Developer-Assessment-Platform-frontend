"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IGlobalQuestion } from "@/types/question.type";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Code2,
  FileText,
  HelpCircle,
  Lock,
  Terminal,
  X,
} from "lucide-react";

interface QuestionPreviewModalProps {
  question: IGlobalQuestion | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (question: IGlobalQuestion) => void;
  isAdmin?: boolean;
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

export function QuestionPreviewModal({
  question,
  isOpen,
  onClose,
  onEdit,
  isAdmin = false,
}: QuestionPreviewModalProps) {
  if (!isOpen || !question) return null;

  const difficultyColors = {
    EASY: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    HARD: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  };

  const normalizedOptions = normalizeMcqOptions(question.mcqOptions);
  const normalizedTestCases = normalizeTestCases(question.testCases);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Close question preview"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Enter") onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Question Details"
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 p-5 bg-card/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`font-bold text-xs uppercase px-2 py-0.5 ${
                  difficultyColors[question.difficulty] || ""
                }`}
              >
                {question.difficulty}
              </Badge>
              <Badge
                variant="secondary"
                className="text-xs font-semibold gap-1"
              >
                {question.type === "CODING" ? (
                  <>
                    <Code2 className="size-3 text-primary" />
                    <span>Coding Challenge</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="size-3 text-purple-400" />
                    <span>Multiple Choice Quiz</span>
                  </>
                )}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                #{question.slug}
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              {question.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm">
          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                Tags:
              </span>
              {question.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-muted/40 text-[11px] text-muted-foreground border-border/80"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Problem Statement */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="size-3.5 text-primary" />
              Problem Description
            </h3>
            <div className="rounded-xl border border-border/70 bg-background/60 p-4 text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans text-xs sm:text-sm">
              {question.problemStatement}
            </div>
          </div>

          {/* Constraints */}
          {question.constraints && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="size-3.5 text-amber-500" />
                Constraints
              </h3>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                {question.constraints}
              </div>
            </div>
          )}

          {/* CODING MODE: Starter Code & Test Cases */}
          {question.type === "CODING" && (
            <>
              {/* Starter Code */}
              {question.starterCode && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Terminal className="size-3.5 text-primary" />
                    Starter Code Template
                  </h3>
                  <div className="rounded-xl border border-border/80 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
                    <pre>
                      {question.starterCode.javascript ||
                        question.starterCode.python ||
                        question.starterCode.typescript ||
                        question.starterCode.cpp ||
                        JSON.stringify(question.starterCode, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Test Cases */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    Test Cases ({normalizedTestCases.length})
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Public samples & hidden evaluation cases
                  </span>
                </div>

                <div className="space-y-2">
                  {normalizedTestCases.length > 0 ? (
                    normalizedTestCases.map((tc, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-border/70 bg-background/70 p-3.5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground">
                            Test Case #{index + 1}
                          </span>
                          {tc.isHidden ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-amber-500 border-amber-500/30 bg-amber-500/10 gap-1 font-semibold"
                            >
                              <Lock className="size-2.5" />
                              Hidden Test Case
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-emerald-500 border-emerald-500/30 bg-emerald-500/10 gap-1 font-semibold"
                            >
                              <Check className="size-2.5" />
                              Sample Case (Public)
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                          <div className="rounded-lg bg-muted/40 p-2.5 border border-border/40">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                              Input
                            </span>
                            <pre className="text-foreground whitespace-pre-wrap">
                              {tc.input}
                            </pre>
                          </div>
                          <div className="rounded-lg bg-muted/40 p-2.5 border border-border/40">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                              Expected Output
                            </span>
                            <pre className="text-foreground whitespace-pre-wrap">
                              {tc.output}
                            </pre>
                          </div>
                        </div>

                        {tc.explanation && (
                          <p className="text-[11px] text-muted-foreground font-sans">
                            <span className="font-semibold text-foreground">
                              Explanation:
                            </span>{" "}
                            {tc.explanation}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No test cases specified for this question.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* MCQ MODE: Options & Correct Answer */}
          {question.type === "MCQ" && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <HelpCircle className="size-3.5 text-purple-400" />
                MCQ Options
              </h3>
              <div className="space-y-2">
                {normalizedOptions.length > 0 ? (
                  normalizedOptions.map((opt, index) => {
                    const isCorrect = Boolean(
                      question.correctOption &&
                        (String(question.correctOption).trim().toLowerCase() ===
                          String(opt.id).trim().toLowerCase() ||
                          String(question.correctOption)
                            .trim()
                            .toLowerCase() ===
                            String(opt.text).trim().toLowerCase()),
                    );

                    return (
                      <div
                        key={`preview-opt-${opt.id}-${index}`}
                        className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                          isCorrect
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold"
                            : "border-border/60 bg-background/50 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex size-6 items-center justify-center rounded-lg font-mono font-bold text-xs ${
                              isCorrect
                                ? "bg-emerald-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {String(opt.id).toUpperCase()}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {isCorrect && (
                          <Badge
                            variant="default"
                            className="bg-emerald-600 text-white text-[10px] px-2 py-0.5"
                          >
                            Correct Answer
                          </Badge>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No options found.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Author Metadata Footer */}
          <div className="rounded-xl border border-border/40 bg-muted/20 p-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Created by:{" "}
              <strong className="text-foreground">
                {question.createdBy?.name || "System Admin"}
              </strong>
            </span>
            <span>
              Last updated: {new Date(question.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/70 p-4 bg-card/80">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8">
            Close Preview
          </Button>

          {isAdmin && onEdit && (
            <Button
              size="sm"
              onClick={() => {
                onClose();
                onEdit(question);
              }}
              className="h-8 bg-primary font-semibold text-white cursor-pointer"
            >
              Edit This Question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
