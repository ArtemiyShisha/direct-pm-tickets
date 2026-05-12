import {
  CRITERIA,
  CRITERIA_GROUPS,
  type EvaluationResult,
  type ProductChallenge,
} from "./types";
import { sanitizeChallengeQuestion } from "./sanitize-challenge";

const STATUS_EMOJI = { ok: "🟢", partial: "🟡", fail: "🔴", na: "⚪" } as const;

const CHALLENGE_TYPE_LABEL: Record<ProductChallenge["type"], string> = {
  question: "Вопрос",
  risk: "Риск",
  contradiction: "Противоречие",
  missing_scenario: "Пропущенный сценарий",
};

const CHALLENGE_SEVERITY_ORDER: Record<ProductChallenge["severity"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function appendChallengesSection(
  lines: string[],
  challenges: ProductChallenge[],
): void {
  if (challenges.length === 0) return;

  const criteriaMap = new Map(CRITERIA.map((c) => [c.id, c]));
  const sorted = [...challenges].sort(
    (a, b) =>
      CHALLENGE_SEVERITY_ORDER[a.severity] -
      CHALLENGE_SEVERITY_ORDER[b.severity],
  );

  lines.push(`## Продуктовые челленджи`, ``);
  lines.push(
    `_Не влияют на оценку. Вопросы и риски к продуктовой идее в контексте Директ Про._`,
    ``,
  );

  for (const challenge of sorted) {
    const severityLabel = challenge.severity.toUpperCase();
    const typeLabel = CHALLENGE_TYPE_LABEL[challenge.type];
    const target = challenge.target ? ` — ${challenge.target}` : "";
    lines.push(`### [${severityLabel}] ${typeLabel}${target}`, ``);

    if (challenge.observation) {
      lines.push(`**Что заметили:** ${challenge.observation}`);
    }
    if (challenge.direct_context) {
      lines.push(`**Контекст Директ Про:** ${challenge.direct_context}`);
    }
    if (challenge.why_it_matters) {
      lines.push(`**Почему это важно:** ${challenge.why_it_matters}`);
    }
    if (challenge.question) {
      const cleaned = sanitizeChallengeQuestion(
        challenge.question,
        challenge.target,
      );
      lines.push(`**Вопрос к PM:** ${cleaned}`);
    }
    if (challenge.good_answer) {
      lines.push(`**Хороший ответ:** ${challenge.good_answer}`);
    }

    const relatedLabels = challenge.related_criteria
      .map((id) => criteriaMap.get(id)?.label ?? id)
      .filter(Boolean);
    if (relatedLabels.length > 0) {
      lines.push(`**Связанные критерии:** ${relatedLabels.join(", ")}`);
    }
    if (challenge.knowledge_card_ids.length > 0) {
      lines.push(
        `**Карточки знания:** ${challenge.knowledge_card_ids.join(", ")}`,
      );
    }

    lines.push(``);
  }
}

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

  if (result.product_challenges && result.product_challenges.length > 0) {
    appendChallengesSection(lines, result.product_challenges);
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
