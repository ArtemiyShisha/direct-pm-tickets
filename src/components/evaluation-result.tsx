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
  type ProductChallenge,
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
  AlertTriangle,
  HelpCircle,
  Compass,
  ClipboardCheck,
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
  },
  partial: {
    label: "PARTIAL",
    emoji: "🟡",
    variant: "secondary" as const,
    border: "border-l-amber-500",
  },
  fail: {
    label: "FAIL",
    emoji: "🔴",
    variant: "destructive" as const,
    border: "border-l-red-500",
  },
  na: {
    label: "N/A",
    emoji: "⚪",
    variant: "outline" as const,
    border: "border-l-gray-300",
  },
};

const challengeSeverityConfig: Record<
  ProductChallenge["severity"],
  { label: string; border: string; badgeVariant: "destructive" | "secondary" | "outline" }
> = {
  high: {
    label: "HIGH",
    border: "border-l-red-500",
    badgeVariant: "destructive",
  },
  medium: {
    label: "MEDIUM",
    border: "border-l-amber-500",
    badgeVariant: "secondary",
  },
  low: {
    label: "LOW",
    border: "border-l-blue-400",
    badgeVariant: "outline",
  },
};

const challengeTypeConfig: Record<
  ProductChallenge["type"],
  { label: string; Icon: typeof HelpCircle }
> = {
  question: { label: "Вопрос", Icon: HelpCircle },
  risk: { label: "Риск", Icon: AlertTriangle },
  contradiction: { label: "Противоречие", Icon: AlertTriangle },
  missing_scenario: { label: "Пропущенный сценарий", Icon: Compass },
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
                <span className="text-black">{item}</span>
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
                <span className="text-black">{item}</span>
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
  const showSummary = criterion.status !== "ok" && criterion.status !== "na";

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger
        className={`flex w-full flex-col gap-1 rounded-lg border border-l-4 bg-white px-4 py-3 text-left transition-colors hover:bg-muted/50 data-[open]:rounded-b-none data-[open]:border-b-0 ${config.border}`}
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
            {criterion.score === -1 ? "N/A" : `${criterion.score}/10`}
          </span>

          <Badge variant={config.variant} className="text-xs shrink-0">
            {config.emoji} {config.label}
          </Badge>
        </div>

        {showSummary && (
          <p className="ml-7 text-xs text-black/70 leading-relaxed line-clamp-2">
            {criterion.comment}
          </p>
        )}
      </CollapsibleTrigger>

      {hasDetails && (
        <CollapsibleContent
          className={`rounded-b-lg border border-t-0 border-l-4 bg-white px-4 pb-4 pt-3 space-y-4 ${config.border}`}
        >
          {criterion.analysis && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-black/60">
                <Search className="h-3 w-3" />
                Анализ
              </div>
              <p className="text-sm text-black leading-relaxed">
                {criterion.analysis}
              </p>
            </div>
          )}

          <FoundMissingLists criterion={criterion} />

          {hasQuestions && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-black/60">
                <MessageCircleQuestion className="h-3 w-3" />
                Вопросы к PM
              </div>
              <ol className="space-y-1 pl-1">
                {criterion.questions.map((q, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold tabular-nums text-black">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-black">{q}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {hasSuggestion && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-black/60">
                  <Lightbulb className="h-3 w-3" />
                  Черновик для вставки
                </div>
                <CopyButton text={criterion.suggestion!} />
              </div>
              <div className="rounded-md bg-muted/60 px-3 py-2 text-sm text-black leading-relaxed whitespace-pre-wrap border">
                {criterion.suggestion}
              </div>
            </div>
          )}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

function ProductChallengeCard({
  challenge,
}: {
  challenge: ProductChallenge;
}) {
  const severity = challengeSeverityConfig[challenge.severity];
  const typeMeta = challengeTypeConfig[challenge.type];
  const TypeIcon = typeMeta.Icon;

  const relatedLabels = challenge.related_criteria
    .map((id) => CRITERIA.find((c) => c.id === id)?.label ?? id)
    .filter(Boolean);

  return (
    <div
      className={`rounded-lg border border-l-4 bg-white px-4 py-3 ${severity.border}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={severity.badgeVariant} className="text-xs">
          {severity.label}
        </Badge>
        <Badge variant="outline" className="text-xs">
          <TypeIcon className="h-3 w-3" />
          {typeMeta.label}
        </Badge>
        {challenge.target && (
          <span className="text-sm font-medium text-foreground">
            {challenge.target}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-3 text-sm text-black leading-relaxed">
        {challenge.observation && (
          <div>
            <div className="text-xs font-medium text-black/60 mb-0.5">
              Что заметили
            </div>
            <p>{challenge.observation}</p>
          </div>
        )}

        {challenge.direct_context && (
          <div>
            <div className="text-xs font-medium text-black/60 mb-0.5">
              Контекст Директ Про
            </div>
            <p>{challenge.direct_context}</p>
          </div>
        )}

        {challenge.why_it_matters && (
          <div>
            <div className="text-xs font-medium text-black/60 mb-0.5">
              Почему это важно
            </div>
            <p>{challenge.why_it_matters}</p>
          </div>
        )}

        {challenge.question && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-black/60 mb-0.5">
              <MessageCircleQuestion className="h-3 w-3" />
              Вопрос к PM
            </div>
            <p className="font-medium">{challenge.question}</p>
          </div>
        )}

        {challenge.good_answer && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-black/60 mb-0.5">
              <ClipboardCheck className="h-3 w-3" />
              Хороший ответ выглядит так
            </div>
            <p className="text-black/80">{challenge.good_answer}</p>
          </div>
        )}
      </div>

      {(relatedLabels.length > 0 || challenge.knowledge_card_ids.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t pt-3">
          {relatedLabels.map((label) => (
            <Badge key={`crit-${label}`} variant="secondary" className="text-xs">
              {label}
            </Badge>
          ))}
          {challenge.knowledge_card_ids.map((id) => (
            <Badge key={`card-${id}`} variant="ghost" className="text-xs font-mono">
              {id}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductChallengesSection({
  challenges,
}: {
  challenges: ProductChallenge[];
}) {
  const sorted = [...challenges].sort((a, b) => {
    const order: Record<ProductChallenge["severity"], number> = {
      high: 0,
      medium: 1,
      low: 2,
    };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between px-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-foreground">
            Продуктовые челленджи
          </h3>
          <span className="text-xs text-muted-foreground">
            {challenges.length}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Не влияют на оценку
        </span>
      </div>
      <p className="px-1 text-xs text-muted-foreground">
        Вопросы и риски к продуктовой идее в контексте Директ Про. Появляются
        даже когда формальные критерии зелёные.
      </p>
      <div className="space-y-2">
        {sorted.map((challenge, i) => (
          <ProductChallengeCard
            key={`${challenge.type}-${i}`}
            challenge={challenge}
          />
        ))}
      </div>
    </div>
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

      {result.product_challenges && result.product_challenges.length > 0 && (
        <ProductChallengesSection challenges={result.product_challenges} />
      )}

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={toggleAll}>
          <ChevronsUpDown className="mr-2 h-4 w-4" />
          {allExpanded ? "Свернуть все" : "Развернуть все"}
        </Button>
      </div>

      {CRITERIA_GROUPS.map((group) => {
        const groupCriteria = group.criteriaIds
          .map((id) => criteriaMap.get(id))
          .filter((c): c is CriterionResult => c !== undefined);

        if (groupCriteria.length === 0) return null;

        const applicableCriteria = groupCriteria.filter((c) => c.score !== -1);
        const avgScore = applicableCriteria.length > 0
          ? Math.round(
              (applicableCriteria.reduce((sum, c) => sum + c.score, 0) /
                applicableCriteria.length) *
                10
            ) / 10
          : -1;

        return (
          <div key={group.id} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-foreground">
                {group.label}
              </h3>
              <span className="text-xs text-muted-foreground tabular-nums">
                {avgScore === -1 ? "" : `Среднее: ${avgScore}/10`}
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
