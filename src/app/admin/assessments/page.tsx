"use client";

import * as React from "react";
import {
  useAssessments,
  useDeleteAssessment,
  useUpdateAssessment,
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
  Building2,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Loader2,
  Mail,
  Plus,
  Shield,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminAssessmentsPage() {
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
        `Admin Action: Are you sure you want to soft-delete assessment "${assessment.title}"?`,
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(assessment.id);
      toast.success("Assessment Deleted", {
        description: `"${assessment.title}" has been removed from platform catalog.`,
      });
    } catch {
      toast.error("Delete Failed", {
        description: "Could not delete assessment. Please try again.",
      });
    }
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400">
                <FileCheck2 className="size-4" />
              </span>
              <span>All Platform Assessments</span>
            </h1>
            <Badge
              variant="outline"
              className="text-xs font-mono border-violet-500/30 text-violet-400"
            >
              Admin Console
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            System-wide assessment monitoring, recruiter audit, and evaluation
            pipeline oversight.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleCreateOpen}
          className="h-9 gap-1.5 text-xs font-bold shadow-md cursor-pointer bg-violet-600 hover:bg-violet-500 text-white self-start sm:self-auto"
        >
          <Plus className="size-4" />
          Create Assessment
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Platform Tests</span>
            <span className="p-1.5 rounded-lg bg-violet-600/10 text-violet-400">
              <FileCheck2 className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-foreground">
            {totalAssessments}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Across all organizations
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
            Currently active
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Global Candidate Invites</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Mail className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-foreground">{totalInvited}</p>
          <p className="text-[11px] text-muted-foreground">
            Total candidate tokens
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Candidate Submissions</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <GraduationCap className="size-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-foreground">
            {totalSubmissions}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Automated evaluations
          </p>
        </div>
      </div>

      {/* Filter Bar */}
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
          <div className="size-12 rounded-2xl bg-violet-600/10 text-violet-400 flex items-center justify-center mx-auto">
            <FileCheck2 className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              No Assessments in Catalog
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No assessments match your current search or filter criteria.
            </p>
          </div>
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
