"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  QuestionDifficulty,
  QuestionQueryParams,
  QuestionType,
} from "@/types/question.type";
import { Plus, RotateCcw, Search, Sparkles, Tag, X } from "lucide-react";

interface QuestionFilterBarProps {
  filters: QuestionQueryParams;
  onChange: (newFilters: Partial<QuestionQueryParams>) => void;
  onReset: () => void;
  onCreateClick?: () => void;
  totalCount?: number;
  isAdmin?: boolean;
}

const POPULAR_TAGS = [
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Tree",
  "Graph",
  "Binary Search",
  "React",
  "JavaScript",
  "Node.js",
  "SQL",
];

export function QuestionFilterBar({
  filters,
  onChange,
  onReset,
  onCreateClick,
  totalCount = 0,
  isAdmin = false,
}: QuestionFilterBarProps) {
  const [searchTerm, setSearchTerm] = React.useState(
    filters.searchTerm || filters.search || "",
  );

  // Debounced search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      onChange({ searchTerm, page: 1 });
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm, onChange]);

  const selectedTags = Array.isArray(filters.tags)
    ? filters.tags
    : typeof filters.tags === "string" && filters.tags
      ? filters.tags.split(",").filter(Boolean)
      : [];

  const handleTagToggle = (tag: string) => {
    const exists = selectedTags.includes(tag);
    const updated = exists
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    onChange({ tags: updated.length ? updated : undefined, page: 1 });
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    (filters.difficulty && filters.difficulty !== "ALL") ||
    (filters.type && filters.type !== "ALL") ||
    selectedTags.length > 0;

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5 backdrop-blur-md shadow-xs">
      {/* Top Header Row with Action CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Filter & Search Catalog
            </h2>
            <Badge
              variant="secondary"
              className="font-mono text-[11px] px-2 py-0.5"
            >
              {totalCount} {totalCount === 1 ? "Problem" : "Problems"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Search by title, filter by difficulty, challenge type, or domain
            tags.
          </p>
        </div>

        {isAdmin && onCreateClick && (
          <Button
            onClick={onCreateClick}
            size="sm"
            className="h-9 gap-1.5 px-4 font-semibold shadow-md bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white cursor-pointer"
          >
            <Plus className="size-4" />
            <span>New Global Question</span>
          </Button>
        )}
      </div>

      {/* Primary Search & Select Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="relative sm:col-span-2 lg:col-span-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or problem statement..."
            className="pl-9 pr-8 h-9.5 text-xs bg-background/90"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Challenge Type Segmented Tabs */}
        <div className="lg:col-span-3 flex items-center rounded-lg border border-border/80 bg-background/80 p-0.5 text-xs">
          {(["ALL", "CODING", "MCQ"] as const).map((t) => {
            const active = (filters.type || "ALL") === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ type: t, page: 1 })}
                className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "ALL"
                  ? "All Types"
                  : t === "CODING"
                    ? "</> Coding"
                    : "✓ MCQ"}
              </button>
            );
          })}
        </div>

        {/* Difficulty Selectors */}
        <div className="lg:col-span-4 flex items-center gap-1.5 flex-wrap">
          {(
            [
              {
                id: "ALL",
                label: "All Difficulties",
                color: "text-muted-foreground",
              },
              {
                id: "EASY",
                label: "Easy",
                color: "text-emerald-500 border-emerald-500/30",
              },
              {
                id: "MEDIUM",
                label: "Medium",
                color: "text-amber-500 border-amber-500/30",
              },
              {
                id: "HARD",
                label: "Hard",
                color: "text-rose-500 border-rose-500/30",
              },
            ] as const
          ).map((item) => {
            const isSelected = (filters.difficulty || "ALL") === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange({ difficulty: item.id, page: 1 })}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/40"
                    : "border-border/70 bg-background/60 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                onReset();
              }}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
              title="Reset all filters"
            >
              <RotateCcw className="size-3.5 mr-1" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Popular Domain Tags Row */}
      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <Tag className="size-3" />
          Tags:
        </span>
        {POPULAR_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                isSelected
                  ? "border-primary/50 bg-primary/15 text-primary font-semibold"
                  : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              #{tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
