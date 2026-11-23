"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAssessmentInvites,
  useDeleteAssessmentInvite,
  useResendAssessmentInvite,
  useSendAssessmentInvites,
} from "@/app/hooks/assessment.hooks";
import type { IAssessment } from "@/types/assessment.type";
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  GraduationCap,
  Loader2,
  Mail,
  RefreshCw,
  RotateCcw,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface AssessmentInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: IAssessment | null;
}

export function AssessmentInviteModal({
  isOpen,
  onClose,
  assessment,
}: AssessmentInviteModalProps) {
  const [emailsInput, setEmailsInput] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const assessmentId = assessment?.id || "";
  const { data: invitesData, isLoading: isLoadingInvites } =
    useAssessmentInvites(
      assessmentId,
      undefined,
      Boolean(assessmentId && isOpen),
    );

  const sendMutation = useSendAssessmentInvites();
  const resendMutation = useResendAssessmentInvite();
  const deleteInviteMutation = useDeleteAssessmentInvite();

  const invites = invitesData?.data || [];

  const handleCopyPublicLink = () => {
    if (!assessment) return;
    const link = `${window.location.origin}/candidate/assessment/${assessment.inviteToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Assessment Link Copied", {
      description: "Direct candidate assessment link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessment) return;

    // Split by comma, semicolon, space or newline and filter valid emails
    const rawList = emailsInput
      .split(/[\s,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = rawList.filter((e) => emailRegex.test(e));

    if (validEmails.length === 0) {
      toast.error("Invalid Emails", {
        description: "Please enter at least one valid email address.",
      });
      return;
    }

    try {
      const res = await sendMutation.mutateAsync({
        assessmentId: assessment.id,
        emails: validEmails,
      });

      const processed = res?.data?.totalProcessed ?? validEmails.length;
      toast.success("Invitations Sent!", {
        description: `Successfully sent assessment invitations to ${processed} candidate(s).`,
      });
      setEmailsInput("");
    } catch (err: unknown) {
      const errorMsg =
        (
          err as {
            message?: string;
            response?: { _data?: { message?: string } };
          }
        )?.response?._data?.message ||
        (err as Error)?.message ||
        "Failed to send invitations. Please try again.";
      toast.error("Failed to Send", { description: errorMsg });
    }
  };

  const handleResend = async (inviteId: string, email: string) => {
    try {
      await resendMutation.mutateAsync(inviteId);
      toast.success("Invitation Resent", {
        description: `Fresh test invitation email sent to ${email}.`,
      });
    } catch {
      toast.error("Resend Failed", {
        description: "Could not resend email invitation.",
      });
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await deleteInviteMutation.mutateAsync(inviteId);
      toast.success("Invitation Cancelled", {
        description: "Candidate invitation revoked.",
      });
    } catch {
      toast.error("Cancel Failed", {
        description: "Could not cancel invitation.",
      });
    }
  };

  if (!isOpen || !assessment) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-200"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 bg-muted/20">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="size-4" />
              </span>
              <h2 className="text-base font-bold text-foreground">
                Candidate Invitations & Tracking
              </h2>
            </div>
            <p className="text-xs text-muted-foreground truncate max-w-md">
              Assessment:{" "}
              <span className="font-semibold text-foreground">
                {assessment.title}
              </span>
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quick Share Link Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ExternalLink className="size-3.5 text-primary" />
                Shareable Assessment Public URL
              </p>
              <p className="text-[11px] text-muted-foreground">
                Candidates with this direct token link can immediately take this
                test.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyPublicLink}
              className="h-8 text-xs font-semibold gap-1.5 shrink-0 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  Copy Test URL
                </>
              )}
            </Button>
          </div>

          {/* Section 1: Send Invites Form */}
          <form onSubmit={handleSendInvites} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="candidate-emails"
                className="text-xs font-bold text-foreground flex items-center gap-1.5"
              >
                <Users className="size-3.5 text-primary" />
                Invite Candidate(s) via Email *
              </Label>
              <span className="text-[10px] text-muted-foreground">
                Comma or line separated
              </span>
            </div>

            <Textarea
              id="candidate-emails"
              rows={3}
              placeholder="e.g. candidate1@gmail.com, candidate2@company.org"
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              className="text-xs font-mono"
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={sendMutation.isPending || !emailsInput.trim()}
                className="h-8 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
              >
                {sendMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Sending Invitations...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    Send Test Invitations
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Section 2: Invited Candidates Tracker */}
          <div className="space-y-3 pt-3 border-t border-border/70">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <GraduationCap className="size-3.5 text-primary" />
                Invited Candidates ({invites.length})
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono">
                Auto-synced
              </Badge>
            </div>

            {isLoadingInvites ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                Loading candidate invites...
              </div>
            ) : invites.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
                No candidates invited yet. Send invitations using the form
                above.
              </div>
            ) : (
              <div className="rounded-xl border border-border/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground border-b border-border/70">
                      <tr>
                        <th className="px-4 py-2.5">Candidate Email</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5">Invited On</th>
                        <th className="px-3 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {invites.map((inv) => (
                        <tr
                          key={inv.id}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-mono text-xs text-foreground truncate max-w-[200px]">
                            {inv.email}
                          </td>
                          <td className="px-3 py-2.5">
                            {inv.status === "ACCEPTED" ? (
                              <Badge
                                variant="default"
                                className="text-[10px] bg-emerald-600"
                              >
                                Completed
                              </Badge>
                            ) : inv.status === "EXPIRED" ? (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                Expired
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-amber-500/30 text-amber-500"
                              >
                                Pending
                              </Badge>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground text-[11px]">
                            {new Date(inv.sentAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2.5 text-right space-x-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleResend(inv.id, inv.email)}
                              disabled={resendMutation.isPending}
                              className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Resend Invite"
                            >
                              <RefreshCw className="size-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteInvite(inv.id)}
                              disabled={deleteInviteMutation.isPending}
                              className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                              title="Cancel Invite"
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border/80 px-5 py-3 bg-muted/10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8 cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
