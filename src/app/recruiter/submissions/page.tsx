"use client";

import * as React from "react";
import { useAssessments } from "@/app/hooks/assessment.hooks";
import { useSubmissionsByAssessment } from "@/app/hooks/submission.hooks";
import { SubmissionFilterBar } from "@/components/submission/submission-filter-bar";
import { SubmissionScorecardModal } from "@/components/submission/submission-scorecard-modal";
import { SubmissionTable } from "@/components/submission/submission-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  ISubmission,
  SubmissionQueryParams,
} from "@/types/submission.type";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

export default function RecruiterSubmissionsPage() {
  const [selectedAssessmentId, setSelectedAssessmentId] =
    React.useState<string>("");
  const [filters, setFilters] = React.useState<SubmissionQueryParams>({
    page: 1,
    limit: 10,
    sortBy: "submittedAt",
    sortOrder: "desc",
  });
  const [inspectSubmissionId, setInspectSubmissionId] = React.useState<
    string | null
  >(null);

  // 1. Fetch Recruiter's assessments to populate dropdown
  const { data: assessmentsData, isLoading: isAssessmentsLoading } =
    useAssessments({
      limit: 50,
    });

  const assessments = assessmentsData?.data || [];

  // Default to first assessment if not selected
  React.useEffect(() => {
    if (!selectedAssessmentId && assessments.length > 0) {
      setSelectedAssessmentId(assessments[0].id);
    }
  }, [assessments, selectedAssessmentId]);

  // 2. Fetch candidate submissions for chosen assessment
  const {
    data: submissionsData,
    isLoading: isSubmissionsLoading,
    refetch,
  } = useSubmissionsByAssessment(
    selectedAssessmentId,
    filters,
    Boolean(selectedAssessmentId),
  );

  const submissions = submissionsData?.data || [];
  const meta = submissionsData?.meta;

  // Compute live metrics
  const totalAttempted = meta?.total || submissions.length;
  const passedCount = submissions.filter((s) => s.isPassed).length;
  const passRate =
    totalAttempted > 0 ? Math.round((passedCount / totalAttempted) * 100) : 0;
  const avgScore =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((acc, s) => acc + (s.totalScore || 0), 0) /
            submissions.length,
        )
      : 0;
  const proctorAlerts = submissions.filter(
    (s) => s.tabSwitchCount > 0 || s.status === "DISQUALIFIED",
  ).length;

  const handleFilterChange = (newFilters: Partial<SubmissionQueryParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "submittedAt",
      sortOrder: "desc",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Candidate Submissions &amp; Grading
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] font-bold uppercase tracking-wider text-primary border-primary/30"
            >
              Hiring Suite
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Review live exam attempts, code submissions, automated scores, and
            anti-cheat logs.
          </p>
        </div>

        {/* Assessment Selector Dropdown */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedAssessmentId}
            onChange={(e) => {
              setSelectedAssessmentId(e.target.value);
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            disabled={isAssessmentsLoading || assessments.length === 0}
            className="h-10 rounded-xl border border-border/80 bg-card px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer min-w-[200px]"
          >
            {assessments.length === 0 ? (
              <option value="">No Assessments Available</option>
            ) : (
              assessments.map((asm) => (
                <option key={asm.id} value={asm.id}>
                  {asm.title}
                </option>
              ))
            )}
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="size-10 cursor-pointer"
            title="Refresh submissions"
          >
            <RefreshCw className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Candidates
            </span>
            <p className="text-2xl font-black text-foreground font-mono">
              {totalAttempted}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Processed submissions
            </p>
          </div>
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="size-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Pass Rate
            </span>
            <p className="text-2xl font-black text-emerald-500 font-mono">
              {passRate}%
            </p>
            <p className="text-[10px] text-emerald-500 font-medium">
              {passedCount} candidates passed
            </p>
          </div>
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Average Score
            </span>
            <p className="text-2xl font-black text-foreground font-mono">
              {avgScore}{" "}
              <span className="text-xs text-muted-foreground font-normal">
                Pts
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground">
              Across all evaluated tests
            </p>
          </div>
          <div className="size-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <Award className="size-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Proctoring Flags
            </span>
            <p className="text-2xl font-black text-amber-500 font-mono">
              {proctorAlerts}
            </p>
            <p className="text-[10px] text-amber-500 font-medium">
              Tab switch or blur incidents
            </p>
          </div>
          <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <AlertTriangle className="size-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <SubmissionFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        totalSubmissions={meta?.total}
      />

      {/* Submissions Table */}
      <SubmissionTable
        submissions={submissions}
        isLoading={isSubmissionsLoading}
        onSelectSubmission={(sub) => setInspectSubmissionId(sub.id)}
        selectedSubmissionId={inspectSubmissionId}
        page={filters.page || 1}
        totalPages={meta?.totalPages || 1}
        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
      />

      {/* Detailed Scorecard Drawer / Modal */}
      {inspectSubmissionId && (
        <SubmissionScorecardModal
          submissionId={inspectSubmissionId}
          onClose={() => setInspectSubmissionId(null)}
          isRecruiter={true}
        />
      )}
    </div>
  );
}
