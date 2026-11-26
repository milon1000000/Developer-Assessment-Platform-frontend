"use client";

import * as React from "react";
import Link from "next/link";
import { useGlobalQuestions } from "@/app/hooks/question.hooks";
import { QuestionFilterBar } from "@/components/question/question-filter-bar";
import { QuestionPreviewModal } from "@/components/question/question-preview-modal";
import { QuestionTable } from "@/components/question/question-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  IGlobalQuestion,
  QuestionQueryParams,
} from "@/types/question.type";
import { BookOpen, Code2, FileCheck2, HelpCircle, Plus } from "lucide-react";

export default function RecruiterQuestionsPage() {
  const [queryParams, setQueryParams] = React.useState<QuestionQueryParams>({
    page: 1,
    limit: 10,
    difficulty: "ALL",
    type: "ALL",
  });

  const { data: questionsData, isLoading } = useGlobalQuestions(queryParams);

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

  const handlePreviewOpen = (question: IGlobalQuestion) => {
    setPreviewQuestion(question);
    setIsPreviewOpen(true);
  };

  const totalCount = meta?.total || 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-cyan-600/15 border border-cyan-500/30 text-cyan-400">
                <BookOpen className="size-4" />
              </span>
              <span>Question Library</span>
            </h1>
            <Badge
              variant="outline"
              className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase"
            >
              Recruiter Catalog
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Explore verified coding challenges, algorithm tasks, and technical
            quizzes to add to your hiring assessments.
          </p>
        </div>

        <Link href="/recruiter/assessments">
          <Button
            size="sm"
            className="h-9 gap-1.5 px-4 font-semibold shadow-md bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white cursor-pointer"
          >
            <FileCheck2 className="size-4" />
            <span>My Assessments</span>
          </Button>
        </Link>
      </div>

      {/* Filter Bar (Read-only / Recruiter mode) */}
      <QuestionFilterBar
        filters={queryParams}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalCount={totalCount}
        isAdmin={false}
      />

      {/* Questions Data Table (Preview only) */}
      <QuestionTable
        questions={questions}
        isLoading={isLoading}
        meta={meta}
        onPageChange={(page) => handleFilterChange({ page })}
        onPreview={handlePreviewOpen}
        isAdmin={false}
      />

      {/* Read-only Question Preview Modal */}
      <QuestionPreviewModal
        question={previewQuestion}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewQuestion(null);
        }}
        isAdmin={false}
      />
    </div>
  );
}
