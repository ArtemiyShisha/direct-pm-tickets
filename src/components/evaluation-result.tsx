"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CRITERIA,
  CRITERIA_GROUPS,
  type CriterionResult,
  type EvaluationResult,
} from "@/lib/types";
import { downloadMarkdown } from "@/lib/export-markdown";
import { ScoreBadge } from "./score-badge";
import {
  Download,
  ChevronRight,
  ChevronDown,
  Search,
  MessageCircleQuestion,
  Lightbulb,
  Copy,
  Check,
  CircleCheck,
  CircleX,
  ChevronsUpDown,
} from "lucide-react";

interface EvaluationResultViewProps {
  result: EvaluationResult;
}

const statusConfig = {
  ok: {
    label: "OK",
    emoji: "🟢",
    variant: "default" as const,
    border: "border-l-emerald-500",
    bg: "",
  },
  partial: {
    label: "PARTIAL",
    emoji: "🟡",
    variant: "secondary" as const,
    border: "border-l-amber-500",
    bg: "bg-amber-50/50",
  },
  fail: {
    label: "FAIL",
    emoji: "🔴",
    variant: "destructive" as const,
    border: "border-l-red-500",
    bg: "bg-red-50/30",
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
      {copied ? (
        <Check className="h-3 w-3 text-emerald-600" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
}

function FoundMissingLists({ criterion }: { criterion: CriterionResult }) {
  const hasFound = criterion.found_items && criterion.found_items.length > 0;
  const hasMissing =
    criterion.missing_items && criterion.missing_items.length > 0;

  if (!hasFound && !hasMissing) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {hasFound && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <CircleCheck className="h-3 w-3" />
            Найдено в эпике
          </div>
          <ul className="space-y-1">
            {criterion.found_items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasMissing && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-red-700">
            <CircleX className="h-3 w-3" />
            Не хватает
          </div>
          <ul className="space-y-1">
            {criterion.missing_items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CriterionCard({
  criterion,
  isOpen,
  onOpenChange,
}: {
  criterion: CriterionResult;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const meta = CRITERIA.find((c) => c.id === criterion.id);
  const config = statusConfig[criterion.status];
  const hasQuestions = criterion.questions.length > 0;
  const hasSuggestion = criterion.suggestion !== null;
  const hasDetails = hasQuestions || hasSuggestion || criterion.analysis;
  const showSummary = criterion.status !== "ok";

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger
        className={`flex w-full flex-col gap-1 rounded-lg border border-l-4 px-4 py-3 text-left transition-colors hover:bg-muted/50 data-[open]:rounded-b-none data-[open]:border-b-0 ${config.border} ${config.bg}`}
      >
        <div className="flex w-full items-center gap-3">
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform [[data-open]>&]:rotate-90" />

          <span className="flex-1 font-medium text-sm text-foreground">
            {meta?.label ?? criterion.id}
            {meta && meta.weight !== 1.0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                x{meta.weight}
              </span>
            )}
          </span>

          <span className="tabular-nums text-sm font-semibold w-12 text-right text-foreground">
            {criterion.score}/10
          </span>

          <Badge variant={config.variant} className="text-xs shrink-0">
            {config.emoji} {config.label}
          </Badge>
        </div>

        {showSummary && (
          <p className="ml-7 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {criterion.comment}
          </p>
        )}
      </CollapsibleTrigger>

      {hasDetails && (
        <CollapsibleContent
          className={`rounded-b-lg border border-t-0 border-l-4 px-4 pb-4 pt-3 space-y-4 ${config.border} ${config.bg}`}
        >
          {criterion.analysis && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Search className="h-3 w-3" />
                Анализ
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {criterion.analysis}
              </p>
            </div>
          )}

          <FoundMissingLists criterion={criterion} />

          {hasQuestions && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MessageCircleQuestion className="h-3 w-3" />
                Вопросы к PM
              </div>
              <ol className="space-y-1 pl-1">
                {criterion.questions.map((q, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold tabular-nums">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-foreground">{q}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {hasSuggestion && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Lightbulb className="h-3 w-3" />
                  Черновик для вставки
                </div>
                <CopyButton text={criterion.suggestion!} />
              </div>
              <div className="rounded-md bg-muted/60 px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap border">
                {criterion.suggestion}
              </div>
            </div>
          )}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export function EvaluationResultView({ result }: EvaluationResultViewProps) {
  const criteriaMap = new Map(result.criteria.map((c) => [c.id, c]));
  const allIds = result.criteria.map((c) => c.id);

  const [openSet, setOpenSet] = useState<Set<string>>(() => new Set());

  const allExpanded = openSet.size === allIds.length;

  const toggleAll = useCallback(() => {
    setOpenSet((prev) =>
      prev.size === allIds.length ? new Set() : new Set(allIds)
    );
  }, [allIds]);

  const setOne = useCallback((id: string, open: boolean) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-8">
        <ScoreBadge score={result.total_score} />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Результат оценки</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={toggleAll}>
                <ChevronsUpDown className="mr-2 h-4 w-4" />
                {allExpanded ? "Свернуть все" : "Развернуть все"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadMarkdown(result)}
              >
                <Download className="mr-2 h-4 w-4" />
                Скачать .md
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Оценка по {result.criteria.length} критериям в 3 группах.
            Раскройте критерий для анализа, вопросов и черновиков.
          </p>
        </div>
      </div>

      {CRITERIA_GROUPS.map((group) => {
        const groupCriteria = group.criteriaIds
          .map((id) => criteriaMap.get(id))
          .filter((c): c is CriterionResult => c !== undefined);

        if (groupCriteria.length === 0) return null;

        const avgScore =
          Math.round(
            (groupCriteria.reduce((sum, c) => sum + c.score, 0) /
              groupCriteria.length) *
              10
          ) / 10;

        return (
          <div key={group.id} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-foreground">
                {group.label}
              </h3>
              <span className="text-xs text-muted-foreground tabular-nums">
                Среднее: {avgScore}/10
              </span>
            </div>
            <div className="space-y-1.5">
              {groupCriteria.map((criterion) => (
                <CriterionCard
                  key={criterion.id}
                  criterion={criterion}
                  isOpen={openSet.has(criterion.id)}
                  onOpenChange={(open) => setOne(criterion.id, open)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
