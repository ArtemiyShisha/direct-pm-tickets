import { CRITERIA, type EvaluationResult } from "./types";

const STATUS_EMOJI = { ok: "🟢", partial: "🟡", fail: "🔴" } as const;

export function exportToMarkdown(result: EvaluationResult): string {
  const criteriaMap = new Map(CRITERIA.map((c) => [c.id, c]));
  const date = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines: string[] = [
    `# Оценка эпика — ${result.total_score}/100`,
    ``,
    `_Дата: ${date}_`,
    ``,
    `## Сводка по критериям`,
    ``,
    `| Критерий | Оценка | Статус | Комментарий | Рекомендация |`,
    `|----------|--------|--------|-------------|--------------|`,
  ];

  for (const c of result.criteria) {
    const meta = criteriaMap.get(c.id);
    const label = meta?.label ?? c.id;
    const emoji = STATUS_EMOJI[c.status];
    const weight = meta && meta.weight !== 1.0 ? ` (x${meta.weight})` : "";
    lines.push(
      `| ${label}${weight} | ${c.score}/10 | ${emoji} ${c.status.toUpperCase()} | ${c.comment} | ${c.recommendation} |`
    );
  }

  if (result.questions.length > 0) {
    lines.push(``, `## Вопросы к менеджеру продукта`, ``);
    result.questions.forEach((q, i) => {
      lines.push(`${i + 1}. ${q}`);
    });
  }

  lines.push(``);
  return lines.join("\n");
}

export function downloadMarkdown(result: EvaluationResult) {
  const md = exportToMarkdown(result);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `epic-review-${result.total_score}-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
