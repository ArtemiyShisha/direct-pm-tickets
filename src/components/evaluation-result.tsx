"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CRITERIA, type EvaluationResult } from "@/lib/types";
import { downloadMarkdown } from "@/lib/export-markdown";
import { ScoreBadge } from "./score-badge";
import { QuestionsList } from "./questions-list";
import { Download } from "lucide-react";

interface EvaluationResultViewProps {
  result: EvaluationResult;
}

const statusConfig = {
  ok: { label: "OK", emoji: "🟢", variant: "default" as const },
  partial: { label: "PARTIAL", emoji: "🟡", variant: "secondary" as const },
  fail: { label: "FAIL", emoji: "🔴", variant: "destructive" as const },
};

export function EvaluationResultView({ result }: EvaluationResultViewProps) {
  const criteriaMap = new Map(CRITERIA.map((c) => [c.id, c]));

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
            Оценка по {result.criteria.length} критериям с учётом весов.
            Высокий вес у критериев Проблема, Решение, Метрики и Ready for Dev.
          </p>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[180px]">Критерий</TableHead>
              <TableHead className="w-[80px] text-center">Оценка</TableHead>
              <TableHead className="w-[100px] text-center">Статус</TableHead>
              <TableHead>Комментарий</TableHead>
              <TableHead>Рекомендация</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.criteria.map((criterion) => {
              const meta = criteriaMap.get(criterion.id);
              const config = statusConfig[criterion.status];

              return (
                <TableRow key={criterion.id}>
                  <TableCell className="font-medium">
                    {meta?.label ?? criterion.id}
                    {meta && meta.weight !== 1.0 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        x{meta.weight}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center tabular-nums font-semibold">
                    {criterion.score}/10
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={config.variant} className="text-xs">
                      {config.emoji} {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{criterion.comment}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {criterion.recommendation}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {result.questions.length > 0 && (
        <QuestionsList questions={result.questions} />
      )}
    </div>
  );
}
