"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useStartAssessment } from "@/app/hooks/submission.hooks";
import { LiveAssessmentIde } from "@/components/submission/live-assessment-ide";
import { Button } from "@/components/ui/button";
import type { IStartAssessmentResponse } from "@/types/submission.type";
import { AlertTriangle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

export default function CandidateLiveExamPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const startAssessmentMutation = useStartAssessment();
  const [examData, setExamData] =
    React.useState<IStartAssessmentResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) return;

    let isMounted = true;
    startAssessmentMutation
      .mutateAsync({ inviteToken: token })
      .then((res) => {
        if (isMounted && res?.data) {
          setExamData(res.data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            (err as { response?: { _data?: { message?: string } } })?.response
              ?._data?.message ||
            (err as Error)?.message ||
            "Unable to start assessment session. Please verify your token or invitation status.";
          setError(msg);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (startAssessmentMutation.isPending || (!examData && !error)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="rounded-3xl border border-border bg-card p-8 text-center space-y-4 max-w-sm w-full shadow-2xl">
          <Loader2 className="size-10 animate-spin text-primary mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              Initializing Exam Environment...
            </h3>
            <p className="text-xs text-muted-foreground">
              Validating anti-cheat token and spinning up code runner sandbox.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !examData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="rounded-3xl border border-destructive/40 bg-card p-8 text-center space-y-4 max-w-md w-full shadow-2xl">
          <div className="size-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mx-auto">
            <AlertTriangle className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              Unable to Launch Assessment
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {error}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/candidate/dashboard")}
            className="text-xs font-semibold cursor-pointer gap-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Workspace</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LiveAssessmentIde
      initialSubmission={examData.submission}
      assessment={examData.assessment}
    />
  );
}
