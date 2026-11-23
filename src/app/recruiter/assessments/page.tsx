"use client";

import * as React from "react";
import {
  useAssessments,
  useDeleteAssessment,
} from "@/app/hooks/assessment.hooks";
import { AssessmentCard } from "@/components/assessment/assessment-card";
import { AssessmentDetailsModal } from "@/components/assessment/assessment-details-modal";
import { AssessmentFilterBar } from "@/components/assessment/assessment-filter-bar";
import { AssessmentInviteModal } from "@/components/assessment/assessment-invite-modal";
import { AssessmentStudioDrawer } from "@/components/assessment/assessment-studio-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AssessmentQueryParams,
  IAssessment,
} from "@/types/assessment.type";
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  GraduationCap,
  Loader2,
  Mail,
  Plus,
  Shield,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function RecruiterAssessmentsPage() {
  const [queryParams, setQueryParams] = React.useState<AssessmentQueryParams>({
    page: 1,
    limit: 12,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: assessmentsData, isLoading } = useAssessments(queryParams);
  const deleteMutation = useDeleteAssessment();

  // Modals & Drawers
  const [isStudioOpen, setIsStudioOpen] = React.useState(false);
  const [assessmentToEdit, setAssessmentToEdit] =
    React.useState<IAssessment | null>(null);

  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const [inviteAssessment, setInviteAssessment] =
    React.useState<IAssessment | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [detailsAssessment, setDetailsAssessment] =
    React.useState<IAssessment | null>(null);

  const assessments = assessmentsData?.data || [];
  const meta = assessmentsData?.meta;

  const handleFilterChange = (newFilters: Partial<AssessmentQueryParams>) => {
    setQueryParams((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setQueryParams({
      page: 1,
      limit: 12,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const handleCreateOpen = () => {
    setAssessmentToEdit(null);
    setIsStudioOpen(true);
  };

  const handleEditOpen = (assessment: IAssessment) => {
    setAssessmentToEdit(assessment);
    setIsStudioOpen(true);
  };

  const handleInviteOpen = (assessment: IAssessment) => {
    setInviteAssessment(assessment);
    setIsInviteOpen(true);
  };

  const handleViewOpen = (assessment: IAssessment) => {
    setDetailsAssessment(assessment);
    setIsDetailsOpen(true);
  };

  const handleDelete = async (assessment: IAssessment) => {
    if (
      !window.confirm(
        `Are you sure you want to delete assessment "${assessment.title}"?`,
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(assessment.id);
      toast.success("Assessment Deleted", {
        description: `"${assessment.title}" has been deleted.`,
      });
    } catch {
      toast.error("Delete Failed", {
        description: "Could not delete assessment. Please try again.",
      });
    }
  };

  // KPI Metrics Calculation
  const totalAssessments = meta?.total || assessments.length;
  const activeAssessments = assessments.filter((a) => a.isActive).length;
  const totalInvited = assessments.reduce(
    (acc, a) => acc + (a._count?.invites || 0),
    0,
  );
  const totalSubmissions = assessments.reduce(
    (acc, a) => acc + (a._count?.submissions || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <FileCheck2 className="size-4" />
              </span>
              <span>Assessments Hub</span>
            </h1>
            <Badge variant="outline" className="text-xs font-mono">
              {totalAssessments} Total
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Configure automated technical evaluations, set anti-cheat
            parameters, and monitor candidate evaluations.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleCreateOpen}
          className="h-9 gap-1.5 text-xs font-bold shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="size-4" />
          Create New Assessment
        </Button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Total Assessments</span>
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <FileCheck2 className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-foreground">
            {totalAssessments}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Configured evaluation tests
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Active Tests</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-500">
            {activeAssessments}
          </p>
          <p className="text-[11px] text-emerald-500 font-medium">
            Available for candidate sessions
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Candidates Invited</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Mail className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-foreground">{totalInvited}</p>
          <p className="text-[11px] text-muted-foreground">
            Personalized test invitations sent
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Completed Submissions</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <GraduationCap className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-foreground">
            {totalSubmissions}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Graded candidate solutions
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <AssessmentFilterBar
        filters={queryParams}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        totalCount={totalAssessments}
      />

      {/* Assessments Grid */}
      {isLoading ? (
        <div className="rounded-2xl border border-border/80 bg-card/40 p-12 text-center">
          <Loader2 className="size-7 animate-spin mx-auto text-primary mb-2" />
          <p className="text-xs font-semibold text-foreground">
            Loading assessments...
          </p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/30 p-12 text-center space-y-3">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <FileCheck2 className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              No Assessments Found
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven't created any assessments yet, or no assessments match
              your active filters.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleCreateOpen}
            size="sm"
            className="text-xs font-bold gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="size-3.5" />
            Create Your First Assessment
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onEdit={handleEditOpen}
              onInvite={handleInviteOpen}
              onView={handleViewOpen}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Studio Drawer (Create / Edit) */}
      <AssessmentStudioDrawer
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        assessmentToEdit={assessmentToEdit}
      />

      {/* Candidate Invite Modal */}
      <AssessmentInviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        assessment={inviteAssessment}
      />

      {/* Assessment Full Details Modal */}
      <AssessmentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        assessment={detailsAssessment}
        onEdit={handleEditOpen}
      />
    </div>
  );
}
