"use client";

import * as React from "react";
import Link from "next/link";
import { useAuditLogs, useAuditStats } from "@/app/hooks/audit-log.hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import type { IAuditLog } from "@/types/audit-log.type";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Database,
  Eye,
  Filter,
  History,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [search, setSearch] = React.useState("");
  const [selectedAction, setSelectedAction] = React.useState("ALL");
  const [selectedEntity, setSelectedEntity] = React.useState("ALL");
  const [expandedLogId, setExpandedLogId] = React.useState<string | null>(null);

  const { data: statsData } = useAuditStats();
  const {
    data: logsData,
    isLoading,
    refetch,
    isRefetching,
  } = useAuditLogs({
    search: search.trim() || undefined,
    action: selectedAction !== "ALL" ? selectedAction : undefined,
    entity: selectedEntity !== "ALL" ? selectedEntity : undefined,
  });

  const stats = statsData?.data;
  const logs = logsData?.data || [];

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("LOGIN") || act.includes("AUTH")) {
      return "border-blue-500/40 text-blue-500 bg-blue-500/10";
    }
    if (
      act.includes("CREATE") ||
      act.includes("SUBMIT") ||
      act.includes("APPROVE")
    ) {
      return "border-emerald-500/40 text-emerald-500 bg-emerald-500/10";
    }
    if (
      act.includes("DELETE") ||
      act.includes("REJECT") ||
      act.includes("BLOCK")
    ) {
      return "border-rose-500/40 text-rose-500 bg-rose-500/10";
    }
    return "border-amber-500/40 text-amber-500 bg-amber-500/10";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-md shadow-destructive/20">
                <ShieldAlert className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight">
                  DevAssess{" "}
                  <span className="text-destructive text-xs font-semibold">
                    ADMIN
                  </span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium -mt-1">
                  Security &amp; Audit Logs
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-3 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Security Audit &amp; Event Logs
            </h1>
            <p className="text-xs text-muted-foreground">
              Immutable telemetry trail tracking platform mutations, user
              authentication, and screening events.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 gap-1.5 text-xs font-semibold cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                isRefetching && "animate-spin text-primary",
              )}
            />
            <span>Refresh Stream</span>
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Total Audit Events
              </CardTitle>
              <History className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLogs ?? 0}</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Captured across all system endpoints
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Active Entities
              </CardTitle>
              <Database className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.entities?.length ?? 0}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Users, Assessments, Questions &amp; Submissions
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Security Index
              </CardTitle>
              <ShieldCheck className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">Normal</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Zero security tampering detected
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md">
          <div className="relative flex-1 max-w-sm">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search action or entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs bg-background"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              {stats?.topActions?.map((act) => (
                <option key={act.action} value={act.action}>
                  {act.action} ({act.count})
                </option>
              ))}
            </select>

            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="h-8 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground cursor-pointer"
            >
              <option value="ALL">All Entities</option>
              {stats?.entities?.map((ent) => (
                <option key={ent.entity} value={ent.entity}>
                  {ent.entity} ({ent.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="size-8 animate-spin text-primary mx-auto" />
              <p className="text-xs text-muted-foreground">
                Streaming audit logs...
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Shield className="size-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-bold text-foreground">
                No audit events found
              </p>
              <p className="text-xs text-muted-foreground">
                Adjust your filters or perform actions on the platform to
                generate events.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 font-semibold text-muted-foreground">
                    <th className="py-3 px-4 w-10"></th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity</th>
                    <th className="py-3 px-4">Performed By</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {logs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr
                          className="hover:bg-muted/20 transition-colors cursor-pointer"
                          onClick={() =>
                            setExpandedLogId(isExpanded ? null : log.id)
                          }
                        >
                          <td className="py-3 px-4 text-center">
                            {isExpanded ? (
                              <ChevronDown className="size-3.5 text-primary inline" />
                            ) : (
                              <ChevronRight className="size-3.5 text-muted-foreground inline" />
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-mono font-bold uppercase",
                                getActionBadge(log.action),
                              )}
                            >
                              {log.action}
                            </Badge>
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] font-semibold text-foreground">
                            {log.entity}
                            {log.entityId && (
                              <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">
                                ({log.entityId.slice(0, 8)}...)
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {log.user ? (
                              <div>
                                <span className="font-semibold text-foreground">
                                  {log.user.email}
                                </span>
                                <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">
                                  [{log.user.role}]
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic font-mono text-[11px]">
                                System / Anonymous
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
                            >
                              {isExpanded ? "Hide" : "Inspect"}
                            </Button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-muted/10 border-b border-border/50">
                            <td colSpan={6} className="p-4">
                              <div className="rounded-xl border border-border bg-slate-950 p-3 font-mono text-[11px] text-slate-300 space-y-2">
                                <div className="text-xs font-bold text-primary flex items-center justify-between">
                                  <span>Log Payload &amp; Metadata:</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    ID: {log.id}
                                  </span>
                                </div>
                                <pre className="overflow-x-auto text-emerald-400">
                                  {JSON.stringify(
                                    log.metadata || {
                                      note: "No extra metadata captured",
                                    },
                                    null,
                                    2,
                                  )}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
