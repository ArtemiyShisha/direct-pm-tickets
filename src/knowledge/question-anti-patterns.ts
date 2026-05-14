/**
 * Categories of questions that the group evaluators MUST NOT generate in
 * `criterion.questions`. These are general anti-patterns of product epic
 * review (not Direct-Pro specific knowledge — for that use knowledge cards).
 *
 * Each entry has:
 * - `pattern` — short label of the question shape we want to avoid;
 * - `reason` — one-sentence explanation why such a question does not belong
 *   on the epic level (so the model understands the rule, not just memorises it).
 *
 * Add a new entry here when you see another category of questions that
 * keeps showing up in evaluations and is consistently out of scope for an
 * epic review. Avoid making this list a dumping ground for one-off knowledge
 * fixes — those belong in knowledge cards (`src/knowledge/direct-pro/`).
 */
export interface QuestionAntiPattern {
  pattern: string;
  reason: string;
}

export const QUESTION_ANTI_PATTERNS: QuestionAntiPattern[] = [
  {
    pattern:
      "Какие конкретные метрики и алерты мониторим в первые дни/часы после запуска (ошибки сохранения, отказы доступа, число объектов на модерации, конверсии и т.п.).",
    reason:
      "Это уровень runbook/операционного запуска, а не продуктового эпика. На эпике достаточно перечня продуктовых метрик и плана раскатки.",
  },
  {
    pattern:
      "Кто принимает решение о расширении раскатки и кто дежурит по инцидентам после запуска.",
    reason:
      "Это вопросы oncall/процессного владения, а не продуктового описания эпика.",
  },
];

/**
 * Render the anti-patterns block as a chunk of system prompt text.
 * Returns an empty string when the list is empty (so callers can safely
 * concatenate without trailing whitespace).
 */
export function buildQuestionAntiPatternsBlock(
  items: QuestionAntiPattern[] = QUESTION_ANTI_PATTERNS,
): string {
  if (items.length === 0) return "";

  const list = items
    .map((item, i) => `${i + 1}. ${item.pattern}\n   Почему не задаём: ${item.reason}`)
    .join("\n");

  return `
АНТИ-ПАТТЕРНЫ ВОПРОСОВ (НЕ задавай вопросы такого характера в поле questions ни одного критерия — даже если кажется, что они уместны):

${list}
`;
}
