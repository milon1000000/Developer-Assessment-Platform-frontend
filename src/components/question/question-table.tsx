"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  IGlobalQuestion,
  QuestionPaginationMeta,
} from "@/types/question.type";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Code2,
  Eye,
  FileQuestion,
  HelpCircle,
  Lock,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";

interface QuestionTableProps {
  questions: IGlobalQuestion[];
  isLoading: boolean;
  meta?: QuestionPaginationMeta;
  onPageChange: (page: number) => void;
  onPreview: (question: IGlobalQuestion) => void;
  onEdit?: (question: IGlobalQuestion) => void;
  onDelete?: (question: IGlobalQuestion) => void;
  isAdmin?: boolean;
}

export function QuestionTable({
  questions,
  isLoading,
  meta,
  onPageChange,
  onPreview,
  onEdit,
  onDelete,
  isAdmin = false,
}: QuestionTableProps) {
  const [questionToDelete, setQuestionToDelete] =
    React.useState<IGlobalQuestion | null>(null);

  const difficultyColors = {
    EASY: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    HARD: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/60 p-12 text-center backdrop-blur-md space-y-3">
        <div className="size-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground">
          Loading questions from repository...
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-12 text-center backdrop-blur-md space-y-3">
        <div className="flex size-12 mx-auto items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
          <FileQuestion className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground">
            No Questions Found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No questions match your current search and filter criteria. Try
            adjusting the filters or create a new question.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-border/70 bg-card/60 shadow-xs backdrop-blur-md overflow-hidden">
        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Title & Slug</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Difficulty</th>
                <th className="py-3 px-3">Domain Tags</th>
                <th className="py-3 px-3">Specs</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {questions.map((q) => {
                const hiddenCount =
                  q.testCases?.filter((tc) => tc.isHidden).length || 0;
                const totalTestCases = q.testCases?.length || 0;

                return (
                  <tr
                    key={q.id}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                    {/* Title & Slug */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => onPreview(q)}
                          className="font-bold text-foreground hover:text-primary transition-colors text-left block truncate max-w-xs sm:max-w-md cursor-pointer"
                        >
                          {q.title}
                        </button>
                        <span className="font-mono text-[10px] text-muted-foreground block">
                          #{q.slug}
                        </span>
                      </div>
                    </td>

                    {/* Challenge Type */}
                    <td className="py-3.5 px-3 shrink-0">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-semibold gap-1"
                      >
                        {q.type === "CODING" ? (
                          <>
                            <Code2 className="size-2.5 text-primary" />
                            <span>Coding</span>
                          </>
                        ) : (
                          <>
                            <HelpCircle className="size-2.5 text-purple-400" />
                            <span>MCQ</span>
                          </>
                        )}
                      </Badge>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3.5 px-3 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase ${
                          difficultyColors[q.difficulty] || ""
                        }`}
                      >
                        {q.difficulty}
                      </Badge>
                    </td>

                    {/* Tags */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1 flex-wrap max-w-xs">
                        {q.tags && q.tags.length > 0 ? (
                          q.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono"
                            >
                              #{tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-[10px]">
                            —
                          </span>
                        )}
                        {q.tags && q.tags.length > 3 && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            +{q.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Specs / Test Cases */}
                    <td className="py-3.5 px-3">
                      {q.type === "CODING" ? (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                          {totalTestCases} Tests
                          {hiddenCount > 0 && (
                            <span
                              className="flex items-center gap-0.5 text-amber-500"
                              title={`${hiddenCount} hidden test cases`}
                            >
                              (<Lock className="size-2.5" />
                              {hiddenCount})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {q.mcqOptions?.length || 0} Options
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPreview(q)}
                          className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="size-3.5" />
                        </Button>

                        {isAdmin && onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(q)}
                            className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Edit Question"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        )}

                        {isAdmin && onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setQuestionToDelete(q)}
                            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/70 p-4 gap-3 bg-card/80 text-xs text-muted-foreground">
            <div>
              Showing{" "}
              <strong className="text-foreground">
                {(meta.page - 1) * meta.limit + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-foreground">
                {Math.min(meta.page * meta.limit, meta.total)}
              </strong>{" "}
              of <strong className="text-foreground">{meta.total}</strong>{" "}
              questions
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(meta.page - 1)}
                disabled={meta.page <= 1}
                className="h-8 gap-1 px-2.5 text-xs"
              >
                <ChevronLeft className="size-3.5" />
                Previous
              </Button>

              <span className="font-semibold px-2 text-foreground">
                Page {meta.page} of {meta.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="h-8 gap-1 px-2.5 text-xs"
              >
                Next
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {questionToDelete && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close dialog backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={() => setQuestionToDelete(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter")
              setQuestionToDelete(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Deletion"
            className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Delete Global Question?
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to remove{" "}
                  <strong className="text-foreground">
                    &quot;{questionToDelete.title}&quot;
                  </strong>
                  ?
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground rounded-lg border border-border/70 bg-muted/30 p-3 leading-relaxed">
              This will soft-delete the problem from the global catalog and
              archive it from future candidate assessments.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuestionToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (onDelete) onDelete(questionToDelete);
                  setQuestionToDelete(null);
                }}
                className="gap-1 font-semibold cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Delete Question</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
