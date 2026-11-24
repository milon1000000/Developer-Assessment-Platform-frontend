"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  SubmissionQueryParams,
  SubmissionStatus,
} from "@/types/submission.type";
import { RotateCcw, Search } from "lucide-react";

interface SubmissionFilterBarProps {
  filters: SubmissionQueryParams;
  onFilterChange: (newFilters: Partial<SubmissionQueryParams>) => void;
  onReset: () => void;
  totalSubmissions?: number;
}

export function SubmissionFilterBar({
  filters,
  onFilterChange,
  onReset,
  totalSubmissions,
}: SubmissionFilterBarProps) {
  const [searchTerm, setSearchTerm] = React.useState(
    filters.searchTerm || filters.search || "",
  );

  React.useEffect(() => {
    setSearchTerm(filters.searchTerm || filters.search || "");
  }, [filters.searchTerm, filters.search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ searchTerm: searchTerm.trim(), page: 1 });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onFilterChange({ searchTerm: searchTerm.trim(), page: 1 });
    }
  };

  const hasActiveFilters =
    Boolean(filters.searchTerm || filters.search) ||
    Boolean(filters.status) ||
    filters.isPassed !== undefined;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur-md">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search Input */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 min-w-[240px] max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search candidate by name or email..."
            className="pl-9 h-10 text-xs bg-background/80"
          />
        </form>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={filters.status || ""}
            onChange={(e) =>
              onFilterChange({
                status: (e.target.value as SubmissionStatus) || undefined,
                page: 1,
              })
            }
            className="h-10 rounded-xl border border-border/80 bg-background/90 px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DISQUALIFIED">Disqualified</option>
            <option value="EXPIRED">Expired</option>
          </select>

          {/* Passed / Failed Filter */}
          <select
            value={
              filters.isPassed === undefined ? "" : String(filters.isPassed)
            }
            onChange={(e) => {
              const val = e.target.value;
              onFilterChange({
                isPassed: val === "" ? undefined : val === "true",
                page: 1,
              });
            }}
            className="h-10 rounded-xl border border-border/80 bg-background/90 px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="">All Results</option>
            <option value="true">Passed Only</option>
            <option value="false">Failed Only</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-10 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}

          {totalSubmissions !== undefined && (
            <div className="hidden sm:flex items-center text-xs font-semibold text-muted-foreground pl-2 border-l border-border/60">
              Total:{" "}
              <span className="text-foreground ml-1 font-bold">
                {totalSubmissions}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
