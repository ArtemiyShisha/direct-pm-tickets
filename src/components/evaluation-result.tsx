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
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
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
          <div className="flex items-center gap-1.5 text-sm font-semibold text-red-700">
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
          className={`rounded-b-lg border border-t-0 border-l-4 bg-white px-4 pb-4 pt-3 ${config.border}`}
        >
          <div className="divide-y divide-border">
            {criterion.analysis && (
              <div className="space-y-1 pb-3 first:pt-0 pt-3">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Search className="h-3 w-3 text-muted-foreground" />
                  Анализ
                </div>
                <p className="text-sm text-black leading-relaxed">
                  {criterion.analysis}
                </p>
              </div>
            )}

            {(criterion.found_items?.length ?? 0) +
              (criterion.missing_items?.length ?? 0) >
              0 && (
              <div className="pb-3 pt-3 first:pt-0">
                <FoundMissingLists criterion={criterion} />
              </div>
            )}

            {hasQuestions && (
              <div className="space-y-1.5 pb-3 pt-3 first:pt-0">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <MessageCircleQuestion className="h-3 w-3 text-muted-foreground" />
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
              <div className="space-y-1.5 pt-3 first:pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Lightbulb className="h-3 w-3 text-muted-foreground" />
                    Черновик для вставки
                  </div>
                  <CopyButton text={criterion.suggestion!} />
                </div>
                <div className="rounded-md bg-muted/60 px-3 py-2 text-sm text-black leading-relaxed whitespace-pre-wrap border">
                  {criterion.suggestion}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

function ProductChallengeCard({
  challenge,
  isOpen,
  onOpenChange,
}: {
  challenge: ProductChallenge;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const severity = challengeSeverityConfig[challenge.severity];
  const typeMeta = challengeTypeConfig[challenge.type];
  const TypeIcon = typeMeta.Icon;

  const relatedLabels = challenge.related_criteria
    .map((id) => CRITERIA.find((c) => c.id === id)?.label ?? id)
    .filter(Boolean);

  const preview = challenge.question ?? challenge.observation ?? "";
  const hasBody =
    Boolean(challenge.observation) ||
    Boolean(challenge.direct_context) ||
    Boolean(challenge.why_it_matters) ||
    Boolean(challenge.question) ||
    Boolean(challenge.good_answer) ||
    relatedLabels.length > 0 ||
    challenge.knowledge_card_ids.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger
        className={`flex w-full flex-col gap-1 rounded-lg border border-l-4 bg-white px-4 py-3 text-left transition-colors hover:bg-muted/50 data-[open]:rounded-b-none data-[open]:border-b-0 ${severity.border}`}
      >
        <div className="flex w-full items-center gap-2">
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform [[data-open]>&]:rotate-90" />
          <Badge variant={severity.badgeVariant} className="text-xs shrink-0">
            {severity.label}
          </Badge>
          <Badge variant="outline" className="text-xs shrink-0">
            <TypeIcon className="h-3 w-3" />
            {typeMeta.label}
          </Badge>
          {challenge.target && (
            <span className="text-sm font-medium text-foreground shrink-0">
              {challenge.target}
            </span>
          )}
        </div>

        {preview && (
          <p className="ml-7 text-xs text-black/70 leading-relaxed line-clamp-2">
            {preview}
          </p>
        )}
      </CollapsibleTrigger>

      {hasBody && (
        <CollapsibleContent
          className={`rounded-b-lg border border-t-0 border-l-4 bg-white px-4 pb-4 pt-3 ${severity.border}`}
        >
          <div className="divide-y divide-border space-y-0">
            {challenge.observation && (
              <div className="space-y-1 pb-3 first:pt-0 pt-3">
                <div className="text-sm font-semibold text-foreground">
                  Что заметили
                </div>
                <p className="text-sm text-black leading-relaxed">
                  {challenge.observation}
                </p>
              </div>
            )}
            {challenge.direct_context && (
              <div className="space-y-1 pb-3 pt-3 first:pt-0">
                <div className="text-sm font-semibold text-foreground">
                  Контекст Директ Про
                </div>
                <p className="text-sm text-black leading-relaxed">
                  {challenge.direct_context}
                </p>
              </div>
            )}
            {challenge.why_it_matters && (
              <div className="space-y-1 pb-3 pt-3 first:pt-0">
                <div className="text-sm font-semibold text-foreground">
                  Почему это важно
                </div>
                <p className="text-sm text-black leading-relaxed">
                  {challenge.why_it_matters}
                </p>
              </div>
            )}
            {challenge.question && (
              <div className="space-y-1 pb-3 pt-3 first:pt-0">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <MessageCircleQuestion className="h-3 w-3 text-muted-foreground" />
                  Вопрос к PM
                </div>
                <p className="text-sm font-medium text-black leading-relaxed">
                  {challenge.question}
                </p>
              </div>
            )}
            {challenge.good_answer && (
              <div className="space-y-1 pb-3 pt-3 first:pt-0">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <ClipboardCheck className="h-3 w-3 text-muted-foreground" />
                  Хороший ответ выглядит так
                </div>
                <p className="text-sm text-black/80 leading-relaxed">
                  {challenge.good_answer}
                </p>
              </div>
            )}
            {(relatedLabels.length > 0 ||
              challenge.knowledge_card_ids.length > 0) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-3">
                {relatedLabels.map((label) => (
                  <Badge
                    key={`crit-${label}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {label}
                  </Badge>
                ))}
                {challenge.knowledge_card_ids.map((id) => (
                  <Badge
                    key={`card-${id}`}
                    variant="ghost"
                    className="text-xs font-mono"
                  >
                    {id}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

function ProductChallengesSection({
  challenges,
  isOpen,
  onItemOpenChange,
}: {
  challenges: ProductChallenge[];
  isOpen: (id: string) => boolean;
  onItemOpenChange: (id: string, open: boolean) => void;
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
        {sorted.map((challenge, i) => {
          const id = `chal-${i}`;
          return (
            <ProductChallengeCard
              key={id}
              challenge={challenge}
              isOpen={isOpen(id)}
              onOpenChange={(open) => onItemOpenChange(id, open)}
            />
          );
        })}
      </div>
    </div>
  );
}

export function EvaluationResultView({ result }: EvaluationResultViewProps) {
  const criteriaMap = new Map(result.criteria.map((c) => [c.id, c]));
  const criteriaIds = result.criteria.map((c) => `crit-${c.id}`);
  const challengeIds = (result.product_challenges ?? []).map(
    (_, i) => `chal-${i}`,
  );
  const allIds = [...criteriaIds, ...challengeIds];

  const [openSet, setOpenSet] = useState<Set<string>>(() => new Set());

  const allExpanded = openSet.size === allIds.length && allIds.length > 0;

  const toggleAll = useCallback(() => {
    setOpenSet((prev) =>
      prev.size === allIds.length ? new Set() : new Set(allIds),
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

  const isOpen = useCallback((id: string) => openSet.has(id), [openSet]);

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
        <ProductChallengesSection
          challenges={result.product_challenges}
          isOpen={isOpen}
          onItemOpenChange={setOne}
        />
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
              {groupCriteria.map((criterion) => {
                const id = `crit-${criterion.id}`;
                return (
                  <CriterionCard
                    key={criterion.id}
                    criterion={criterion}
                    isOpen={isOpen(id)}
                    onOpenChange={(open) => setOne(id, open)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
