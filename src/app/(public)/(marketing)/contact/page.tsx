import {
  Building2,
  Clock,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact | DevAssess",
  description:
    "Support information, recruiter onboarding guidance, and candidate assessment help for DevAssess.",
};

const SUPPORT_DESKS = [
  {
    title: "Candidate Assessment Support",
    detail:
      "Assistance with invitation token verification, active exam sessions, or scorecard visibility.",
    contact: "support@devassess.dev",
    hours: "Sat – Thu, 10:00 AM – 8:00 PM (+06:00)",
    icon: Terminal,
  },
  {
    title: "Recruiter Onboarding Desk",
    detail:
      "Help with recruiter registration approval, company profile updates, and invite management.",
    contact: "recruiters@devassess.dev",
    hours: "Sat – Thu, 10:00 AM – 6:00 PM (+06:00)",
    icon: Building2,
  },
  {
    title: "Platform Security & Audit",
    detail:
      "Queries related to proctoring telemetry, role permissions, and audit event logs.",
    contact: "security@devassess.dev",
    hours: "Monitored 24/7 for critical incidents",
    icon: ShieldCheck,
  },
] as const;

const COMMON_QUESTIONS = [
  {
    question: "How is a Recruiter account activated?",
    answer:
      "After registering as a Recruiter and verifying your email via OTP, a Platform Admin reviews and approves your application before dashboard access is enabled.",
  },
  {
    question: "What if an assessment invitation link shows expired?",
    answer:
      "Each invitation has an expiry timestamp. Contact the recruiter who sent the invite so they can click Resend in the Invites Hub to generate a fresh link.",
  },
  {
    question: "What triggers proctoring flags during an exam?",
    answer:
      "Switching browser tabs, losing window focus, exiting fullscreen, or copy-paste actions are logged. Exceeding the assessment's max tab-switch limit can disqualify the attempt.",
  },
] as const;

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      {/* Simple Page Intro */}
      <section className="space-y-3 border-b border-border/60 pb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Contact &amp; Support
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl text-foreground">
          Get Help with DevAssess
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
          Find the right support contact and quick answers for candidates,
          recruiters, and administrators using the DevAssess platform.
        </p>
      </section>

      {/* Support Information Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {SUPPORT_DESKS.map((desk) => {
          const Icon = desk.icon;
          return (
            <Card
              key={desk.title}
              className="border-border/70 bg-card/70 backdrop-blur-sm"
            >
              <CardHeader className="pb-3 space-y-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <CardTitle className="text-base font-bold">
                  {desk.title}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {desk.detail}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs">
                <p className="font-mono font-semibold text-foreground">
                  {desk.contact}
                </p>
                <p className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="size-3.5 shrink-0" />
                  <span>{desk.hours}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Quick Help & Location */}
      <section className="grid gap-6 md:grid-cols-12 items-start">
        <div className="md:col-span-8 space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="size-4 text-primary" />
            <span>Common Questions</span>
          </h2>

          <div className="space-y-3">
            {COMMON_QUESTIONS.map((item) => (
              <div
                key={item.question}
                className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-1.5"
              >
                <h3 className="text-sm font-semibold text-foreground">
                  {item.question}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Card className="md:col-span-4 border-border/70 bg-card/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <span>Platform Access</span>
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              DevAssess operates online for remote technical evaluations and
              live coding assessments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Operations</p>
              <p>Dhaka, Bangladesh (UTC+06:00)</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/login">
                <Button
                  size="sm"
                  className="text-xs font-semibold cursor-pointer"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-semibold cursor-pointer"
                >
                  About Platform
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
