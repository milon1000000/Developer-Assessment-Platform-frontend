"use client";

import * as React from "react";
import Link from "next/link";
import { useMySubmissions } from "@/app/hooks/submission.hooks";
import { SubmissionScorecardModal } from "@/components/submission/submission-scorecard-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { ISubmission } from "@/types/submission.type";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Code2,
  Eye,
  FileCheck2,
  GraduationCap,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

export default function CandidateMySubmissionsPage() {
  const { data: submissionsData, isLoading } = useMySubmissions();
  const [inspectSubmissionId, setInspectSubmissionId] = React.useState<
    string | null
  >(null);

  const submissions = submissionsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          My Assessment Submissions
        </h1>
        <p className="text-xs text-muted-foreground">
          Track your completed technical screening assessments, test case
          scores, and recruiter verdicts.
        </p>
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <div className="rounded-2xl border border-border/70 bg-card p-12 text-center space-y-3">
          <Loader2 className="size-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">
            Retrieving your submission records...
          </p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3 bg-card/40">
          <div className="size-12 rounded-2xl bg-muted/40 text-muted-foreground flex items-center justify-center mx-auto">
            <GraduationCap className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            No Assessment Submissions Yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You have not participated in any technical evaluations yet. When you
            accept an assessment invite, your scorecard will appear here.
          </p>
          <Link href="/candidate/dashboard">
            <Button size="sm" className="text-xs font-bold mt-2 cursor-pointer">
              Go to Workspace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-primary/40"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-sm font-bold text-foreground">
                    {sub.assessment?.title || "Technical Assessment"}
                  </h3>
                  {sub.assessment?.recruiter?.companyName && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-bold"
                    >
                      {sub.assessment.recruiter.companyName}
                    </Badge>
                  )}
                  {sub.status === "SUBMITTED" ? (
                    sub.isPassed ? (
                      <Badge
                        variant="default"
                        className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[9px] font-bold"
                      >
                        <CheckCircle2 className="size-2.5 mr-1" />
                        PASSED ({sub.percentage}%)
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-rose-500/15 text-rose-500 border border-rose-500/30 text-[9px] font-bold"
                      >
                        <XCircle className="size-2.5 mr-1" />
                        FAILED ({sub.percentage}%)
                      </Badge>
                    )
                  ) : (
                    <Badge variant="outline" className="text-[9px] font-bold">
                      {sub.status}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-mono">
                  <span>
                    Score:{" "}
                    <strong className="text-foreground">
                      {sub.totalScore} / {sub.maxScore || 100}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Submitted:{" "}
                    {sub.submittedAt
                      ? new Date(sub.submittedAt).toLocaleDateString()
                      : "In Progress"}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setInspectSubmissionId(sub.id)}
                className="h-9 gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
              >
                <Eye className="size-3.5" />
                <span>View Scorecard</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Scorecard Modal */}
      {inspectSubmissionId && (
        <SubmissionScorecardModal
          submissionId={inspectSubmissionId}
          onClose={() => setInspectSubmissionId(null)}
          isRecruiter={false}
        />
      )}
    </div>
  );
}
