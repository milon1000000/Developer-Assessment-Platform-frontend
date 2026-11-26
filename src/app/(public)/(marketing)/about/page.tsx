import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Cpu,
  FileCheck2,
  ShieldAlert,
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
  title: "About | DevAssess",
  description:
    "Overview of the DevAssess Developer Assessment Platform, user roles, live coding sandbox, proctoring, and automated grading.",
};

const PLATFORM_ROLES = [
  {
    title: "Developer",
    icon: Terminal,
    description:
      "Access invited assessments via token links, solve MCQ and coding problems in the live exam IDE, run sample test cases, and view final scorecards.",
    points: [
      "Invite-token gateway and exam timer",
      "Starter templates across 14 languages",
      "Personal submission history & feedback",
    ],
  },
  {
    title: "Recruiter",
    icon: Building2,
    description:
      "Create timed technical assessments from the Global Question Bank or custom problems, send candidate invites, and review graded submissions.",
    points: [
      "Assessment builder with pass thresholds",
      "Email invite tracking & resend support",
      "Manual score adjustment & code review notes",
    ],
  },
  {
    title: "Admin",
    icon: ShieldAlert,
    description:
      "Curate the Global Question Bank, approve or reject recruiter applications, manage platform users, and monitor security audit logs.",
    points: [
      "Global Question Bank management",
      "Recruiter verification & user status control",
      "System-wide Security & Audit Event Logs",
    ],
  },
] as const;

const CORE_MODULES = [
  {
    title: "Assessment & Question Studio",
    detail:
      "Supports both Coding and MCQ questions with Easy, Medium, and Hard difficulty levels, tags, constraints, and hidden grading test cases.",
    icon: FileCheck2,
  },
  {
    title: "Sandboxed Code Runner",
    detail:
      "Executes candidate solutions against test cases in an isolated Node.js VM context with per-test timeout protection and automatic score calculation.",
    icon: Cpu,
  },
  {
    title: "Real-Time Proctoring",
    detail:
      "Tracks TAB_SWITCH, COPY_PASTE, WINDOW_BLUR, and FULLSCREEN_EXIT events with configurable max tab-switch limits per assessment.",
    icon: ShieldCheck,
  },
] as const;

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      {/* Simple Page Intro */}
      <section className="space-y-3 border-b border-border/60 pb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          About DevAssess
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl text-foreground">
          Developer Assessment &amp; Technical Screening Platform
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
          DevAssess helps engineering teams evaluate candidates through timed
          coding and MCQ assessments, automated test-case grading, proctoring
          telemetry, and structured scorecard reviews.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/register">
            <Button
              size="sm"
              className="gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <span>Create Account</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold cursor-pointer"
            >
              Contact Support
            </Button>
          </Link>
        </div>
      </section>

      {/* Three Platform Roles */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Platform Roles</h2>
          <p className="text-xs text-muted-foreground">
            Role-based workspaces built for candidates, hiring teams, and
            administrators.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLATFORM_ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.title}
                className="border-border/70 bg-card/70 backdrop-blur-sm"
              >
                <CardHeader className="pb-3 space-y-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <CardTitle className="text-base font-bold">
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {role.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-start gap-2 text-xs text-foreground/90"
                    >
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Core Modules */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">
            Core Architecture
          </h2>
          <p className="text-xs text-muted-foreground">
            Key capabilities powering every assessment session.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {CORE_MODULES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Icon className="size-4 text-primary shrink-0" />
                  <span>{item.title}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
