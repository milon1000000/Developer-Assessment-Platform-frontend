"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  GraduationCap,
  Loader2,
  Monitor,
  Shield,
  ShieldAlert,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { verifyAssessmentInviteToken } from "@/api/assessment.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IAssessmentInvite } from "@/types/assessment.type";

export default function CandidateAssessmentGatewayPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [inviteData, setInviteData] = React.useState<any>(null);
  const [isAgreed, setIsAgreed] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;

    let isMounted = true;
    setIsLoading(true);

    verifyAssessmentInviteToken(token)
      .then((res) => {
        if (isMounted) {
          setInviteData(res.data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            (err as { response?: { _data?: { message?: string } } })?.response
              ?._data?.message ||
            (err as Error)?.message ||
            "Invalid or expired invitation token. Please check your invitation link.";
          setError(msg);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3 shadow-lg max-w-sm w-full">
          <Loader2 className="size-8 animate-spin mx-auto text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            Verifying Assessment Token...
          </h2>
          <p className="text-xs text-muted-foreground">
            Validating candidate access credentials and proctoring parameters.
          </p>
        </div>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="rounded-2xl border border-destructive/40 bg-card p-8 text-center space-y-4 shadow-xl max-w-md w-full">
          <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertTriangle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">
              Invitation Access Restricted
            </h2>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="text-xs font-semibold cursor-pointer"
          >
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  const assessment = inviteData.assessment;
  const recruiter = assessment?.recruiter;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Simple Header */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-card/85 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center font-mono font-bold text-white shadow-md text-sm">
            &lt;/&gt;
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-foreground">
              DevAssess
            </span>
            <span className="block text-[10px] text-muted-foreground font-semibold">
              Candidate Evaluation Gateway
            </span>
          </div>
        </div>

        <Badge
          variant="outline"
          className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 font-bold text-[10px]"
        >
          Token Verified
        </Badge>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl rounded-3xl border border-border/80 bg-card/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {/* Assessment Title Header */}
          <div className="space-y-1.5 pb-4 border-b border-border/70">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Technical Assessment
              </span>
              {recruiter?.companyName && (
                <Badge variant="secondary" className="text-[10px] font-bold">
                  {recruiter.companyName}
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {assessment.title}
            </h1>
            {assessment.description && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                {assessment.description}
              </p>
            )}
          </div>

          {/* Test Specs Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Clock className="size-3 text-primary" />
                Duration
              </span>
              <p className="text-sm font-bold text-foreground">
                {assessment.durationMinutes} Minutes
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Code2 className="size-3 text-cyan-400" />
                Questions
              </span>
              <p className="text-sm font-bold text-foreground">
                {assessment.totalQuestions || "Multiple"} Items
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-500" />
                Pass Mark
              </span>
              <p className="text-sm font-bold text-foreground">
                {assessment.passingScore}%
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <ShieldAlert className="size-3 text-amber-500" />
                Proctoring
              </span>
              <p className="text-sm font-bold text-foreground">
                Max {assessment.maxTabSwitches} Switches
              </p>
            </div>
          </div>

          {/* System & Integrity Readiness Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Exam Rules & Anti-Cheat Agreement:
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl border border-border/70 bg-muted/10">
                <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground">
                    Tab Switching & Blur Detection Active
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Navigating outside of the active exam window or switching
                    tabs is monitored. Exceeding {assessment.maxTabSwitches} tab
                    switches will flag your test.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-border/70 bg-muted/10">
                <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground">
                    Timer Counts Continuously
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Once started, the {assessment.durationMinutes}-minute
                    countdown timer cannot be paused or restarted. Ensure a
                    stable internet connection.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-border/70 bg-muted/10">
                <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-foreground">
                    Code Execution & Grading Cloud Sandbox
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Your code will be compiled against public sample test cases
                    and automated hidden grading test cases.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Agreement Checkbox & Action Button */}
          <div className="pt-4 border-t border-border/70 space-y-4">
            <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary size-4 mt-0.5 cursor-pointer"
              />
              <span>
                I confirm that I will complete this assessment independently and
                agree to the exam proctoring and code plagiarism policies.
              </span>
            </label>

            <Button
              type="button"
              disabled={!isAgreed}
              size="lg"
              onClick={() => {
                // Navigate to candidate arena with token
                router.push(`/candidate/exam/${token}`);
              }}
              className="w-full text-xs sm:text-sm font-bold gap-2 shadow-lg cursor-pointer h-11"
            >
              Start Assessment Session
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
