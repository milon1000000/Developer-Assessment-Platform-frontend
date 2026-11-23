"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AssessmentQueryParams } from "@/types/assessment.type";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";

interface AssessmentFilterBarProps {
  filters: AssessmentQueryParams;
  onFilterChange: (newFilters: Partial<AssessmentQueryParams>) => void;
  onReset: () => void;
  totalCount?: number;
}

export function AssessmentFilterBar({
  filters,
  onFilterChange,
  onReset,
  totalCount,
}: AssessmentFilterBarProps) {
  const [localSearch, setLocalSearch] = React.useState(
    filters.searchTerm || filters.title || "",
  );

  // Debounced search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.searchTerm || "")) {
        onFilterChange({ searchTerm: localSearch || undefined, page: 1 });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [localSearch, filters.searchTerm, onFilterChange]);

  const activeStatus =
    filters.isActive === undefined || filters.isActive === ""
      ? "ALL"
      : filters.isActive === "true" || filters.isActive === true
        ? "ACTIVE"
        : "INACTIVE";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-3 sm:p-4 shadow-xs backdrop-blur-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search assessments by title..."
            className="pl-9 text-xs h-9"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          <Button
            type="button"
            variant={activeStatus === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange({ isActive: undefined, page: 1 })}
            className="h-8 text-xs font-semibold px-3"
          >
            All {totalCount !== undefined ? `(${totalCount})` : ""}
          </Button>
          <Button
            type="button"
            variant={activeStatus === "ACTIVE" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange({ isActive: "true", page: 1 })}
            className="h-8 text-xs font-semibold px-3 gap-1.5"
          >
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Active
          </Button>
          <Button
            type="button"
            variant={activeStatus === "INACTIVE" ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange({ isActive: "false", page: 1 })}
            className="h-8 text-xs font-semibold px-3 gap-1.5"
          >
            <span className="size-1.5 rounded-full bg-amber-500" />
            Draft / Inactive
          </Button>
        </div>
      </div>

      {/* Secondary Row: Sorting & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-3.5 text-muted-foreground" />
          <span className="font-medium">Sort by:</span>
          <select
            value={`${filters.sortBy || "createdAt"}-${filters.sortOrder || "desc"}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split("-");
              onFilterChange({
                sortBy,
                sortOrder: sortOrder as "asc" | "desc",
                page: 1,
              });
            }}
            className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="durationMinutes-desc">Duration (Longest)</option>
            <option value="durationMinutes-asc">Duration (Shortest)</option>
            <option value="passingScore-desc">
              Passing Score (High to Low)
            </option>
          </select>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocalSearch("");
            onReset();
          }}
          className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 cursor-pointer"
        >
          <RotateCcw className="size-3" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
