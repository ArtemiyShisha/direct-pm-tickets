"use client";

import { useState } from "react";
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
  Search,
  MessageCircleQuestion,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";

interface EvaluationResultViewProps {
  result: EvaluationResult;
}

const statusConfig = {
  ok: { label: "OK", emoji: "🟢", variant: "default" as const },
  partial: { label: "PARTIAL", emoji: "🟡", variant: "secondary" as const },
  fail: { label: "FAIL", emoji: "🔴", variant: "destructive" as const },
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

function CriterionCard({ criterion }: { criterion: CriterionResult }) {
  const meta = CRITERIA.find((c) => c.id === criterion.id);
  const config = statusConfig[criterion.status];
  const hasQuestions = criterion.questions.length > 0;
  const hasSuggestion = criterion.suggestion !== null;
  const hasDetails = hasQuestions || hasSuggestion || criterion.analysis;

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors hover:bg-muted/50 data-[open]:rounded-b-none data-[open]:border-b-0">
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform [[data-open]>&]:rotate-90" />

        <span className="flex-1 font-medium text-sm">
          {meta?.label ?? criterion.id}
          {meta && meta.weight !== 1.0 && (
            <span className="ml-1.5 text-xs text-muted-foreground">
              x{meta.weight}
            </span>
          )}
        </span>

        <span className="tabular-nums text-sm font-semibold w-12 text-right">
          {criterion.score}/10
        </span>

        <Badge variant={config.variant} className="text-xs shrink-0">
          {config.emoji} {config.label}
        </Badge>
      </CollapsibleTrigger>

      {hasDetails && (
        <CollapsibleContent className="rounded-b-lg border border-t-0 px-4 pb-4 pt-2 space-y-3">
          {criterion.analysis && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Search className="h-3 w-3" />
                Анализ
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {criterion.analysis}
              </p>
            </div>
          )}

          <p className="text-sm">{criterion.comment}</p>

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
                    <span className="pt-0.5">{q}</span>
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
              <div className="rounded-md bg-muted/50 px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap">
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

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-8">
        <ScoreBadge score={result.total_score} />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Результат оценки</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadMarkdown(result)}
            >
              <Download className="mr-2 h-4 w-4" />
              Скачать .md
            </Button>
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
              <h3 className="text-sm font-semibold">{group.label}</h3>
              <span className="text-xs text-muted-foreground tabular-nums">
                Среднее: {avgScore}/10
              </span>
            </div>
            <div className="space-y-1">
              {groupCriteria.map((criterion) => (
                <CriterionCard key={criterion.id} criterion={criterion} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
