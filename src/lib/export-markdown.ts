import { CRITERIA, CRITERIA_GROUPS, type EvaluationResult } from "./types";

const STATUS_EMOJI = { ok: "🟢", partial: "🟡", fail: "🔴", na: "⚪" } as const;

export function exportToMarkdown(result: EvaluationResult): string {
  const criteriaMap = new Map(CRITERIA.map((c) => [c.id, c]));
  const resultMap = new Map(result.criteria.map((c) => [c.id, c]));
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
  ];

  for (const group of CRITERIA_GROUPS) {
    lines.push(`## ${group.label}`, ``);
    lines.push(
      `| Критерий | Оценка | Статус | Комментарий |`,
      `|----------|--------|--------|-------------|`
    );

    for (const id of group.criteriaIds) {
      const c = resultMap.get(id);
      if (!c) continue;
      const meta = criteriaMap.get(id);
      const label = meta?.label ?? id;
      const emoji = STATUS_EMOJI[c.status];
      const weight = meta && meta.weight !== 1.0 ? ` (x${meta.weight})` : "";
      const scoreText = c.score === -1 ? "N/A" : `${c.score}/10`;
      lines.push(
        `| ${label}${weight} | ${scoreText} | ${emoji} ${c.status.toUpperCase()} | ${c.comment} |`
      );
    }

    lines.push(``);

    for (const id of group.criteriaIds) {
      const c = resultMap.get(id);
      if (!c) continue;
      const meta = criteriaMap.get(id);
      const label = meta?.label ?? id;

      const hasDetail =
        c.questions.length > 0 || c.suggestion || c.analysis;
      if (!hasDetail) continue;

      lines.push(`### ${label}`);

      if (c.analysis) {
        lines.push(``, `**Анализ:** ${c.analysis}`);
      }

      if (c.found_items && c.found_items.length > 0) {
        lines.push(``, `**✓ Найдено в эпике:**`);
        c.found_items.forEach((item) => lines.push(`- ${item}`));
      }

      if (c.missing_items && c.missing_items.length > 0) {
        lines.push(``, `**✗ Не хватает:**`);
        c.missing_items.forEach((item) => lines.push(`- ${item}`));
      }

      if (c.questions.length > 0) {
        lines.push(``, `**Вопросы к PM:**`);
        c.questions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
      }

      if (c.suggestion) {
        lines.push(
          ``,
          `**Черновик для вставки:**`,
          ``,
          `> ${c.suggestion.replace(/\n/g, "\n> ")}`
        );
      }

      lines.push(``);
    }
  }

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
