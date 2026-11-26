"use client";

import * as React from "react";
import {
  useDeleteGlobalQuestion,
  useGlobalQuestions,
} from "@/app/hooks/question.hooks";
import { QuestionFilterBar } from "@/components/question/question-filter-bar";
import { QuestionPreviewModal } from "@/components/question/question-preview-modal";
import { QuestionStudioDrawer } from "@/components/question/question-studio-drawer";
import { QuestionTable } from "@/components/question/question-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  IGlobalQuestion,
  QuestionQueryParams,
} from "@/types/question.type";
import { Code2, HelpCircle, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AdminQuestionsPage() {
  const [queryParams, setQueryParams] = React.useState<QuestionQueryParams>({
    page: 1,
    limit: 10,
    difficulty: "ALL",
    type: "ALL",
  });

  const { data: questionsData, isLoading } = useGlobalQuestions(queryParams);
  const deleteMutation = useDeleteGlobalQuestion();

  // Modals / Drawers state
  const [isStudioOpen, setIsStudioOpen] = React.useState(false);
  const [questionToEdit, setQuestionToEdit] =
    React.useState<IGlobalQuestion | null>(null);

  const [previewQuestion, setPreviewQuestion] =
    React.useState<IGlobalQuestion | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const questions = questionsData?.data || [];
  const meta = questionsData?.meta;

  const handleFilterChange = (newFilters: Partial<QuestionQueryParams>) => {
    setQueryParams((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setQueryParams({
      page: 1,
      limit: 10,
      difficulty: "ALL",
      type: "ALL",
    });
  };

  const handleCreateOpen = () => {
    setQuestionToEdit(null);
    setIsStudioOpen(true);
  };

  const handleEditOpen = (question: IGlobalQuestion) => {
    setQuestionToEdit(question);
    setIsStudioOpen(true);
  };

  const handlePreviewOpen = (question: IGlobalQuestion) => {
    setPreviewQuestion(question);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (question: IGlobalQuestion) => {
    try {
      await deleteMutation.mutateAsync(question.id);
      toast.success("Question Deleted", {
        description: `"${question.title}" was soft-deleted from the global catalog.`,
      });
    } catch {
      toast.error("Delete Failed", {
        description: "Failed to delete question. Please try again.",
      });
    }
  };

  // Quick stats counts
  const totalCount = meta?.total || 0;
  const codingCount = questions.filter((q) => q.type === "CODING").length;
  const mcqCount = questions.filter((q) => q.type === "MCQ").length;

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400">
                <Code2 className="size-4" />
              </span>
              <span>Global Question Bank</span>
            </h1>
            <Badge
              variant="outline"
              className="border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-bold uppercase"
            >
              Admin Studio
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Central repository of technical coding challenges, algorithm
            problems, and MCQs for platform assessments.
          </p>
        </div>

        {/* Metrics Badge Group */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="rounded-xl border border-border/70 bg-card/60 px-3 py-1.5 backdrop-blur-md flex items-center gap-1.5 shadow-xs">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-bold text-foreground">{totalCount}</span>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-primary flex items-center gap-1.5 shadow-xs">
            <Code2 className="size-3.5" />
            <span>{codingCount} Coding</span>
          </div>
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-purple-400 flex items-center gap-1.5 shadow-xs">
            <HelpCircle className="size-3.5" />
            <span>{mcqCount} MCQ</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <QuestionFilterBar
        filters={queryParams}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        onCreateClick={handleCreateOpen}
        totalCount={totalCount}
        isAdmin={true}
      />

      {/* Questions Data Table */}
      <QuestionTable
        questions={questions}
        isLoading={isLoading}
        meta={meta}
        onPageChange={(page) => handleFilterChange({ page })}
        onPreview={handlePreviewOpen}
        onEdit={handleEditOpen}
        onDelete={handleDelete}
        isAdmin={true}
      />

      {/* Create / Edit Studio Drawer */}
      <QuestionStudioDrawer
        isOpen={isStudioOpen}
        onClose={() => {
          setIsStudioOpen(false);
          setQuestionToEdit(null);
        }}
        questionToEdit={questionToEdit}
      />

      {/* Read-only Question Preview Modal */}
      <QuestionPreviewModal
        question={previewQuestion}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewQuestion(null);
        }}
        onEdit={handleEditOpen}
        isAdmin={true}
      />
    </div>
  );
}
