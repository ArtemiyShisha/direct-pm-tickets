export const CRITERIA = [
  { id: "problem", label: "Проблема", weight: 1.5 },
  { id: "solution", label: "Решение", weight: 1.5 },
  { id: "potential", label: "Потенциал", weight: 1.0 },
  { id: "metrics", label: "Метрики успеха", weight: 1.5 },
  { id: "analytics", label: "Аналитика", weight: 1.0 },
  { id: "design", label: "Дизайн", weight: 0.7 },
  { id: "scenarios", label: "Сценарии", weight: 1.0 },
  { id: "corner_cases", label: "Корнер-кейсы", weight: 1.0 },
  { id: "onboarding", label: "Онбординг", weight: 0.7 },
  { id: "interfaces", label: "Интерфейсы", weight: 0.7 },
  { id: "international", label: "Межнар", weight: 0.7 },
  { id: "ready_for_dev", label: "Ready For Development", weight: 1.5 },
  { id: "logging", label: "Логирование", weight: 0.7 },
  { id: "launch", label: "Запуск", weight: 1.0 },
] as const;

export type CriterionId = (typeof CRITERIA)[number]["id"];

export type Status = "ok" | "partial" | "fail";

export interface CriterionResult {
  id: CriterionId;
  score: number;
  status: Status;
  comment: string;
  recommendation: string;
}

export interface EvaluationResult {
  criteria: CriterionResult[];
  total_score: number;
  questions: string[];
}

export function scoreToStatus(score: number): Status {
  if (score >= 7) return "ok";
  if (score >= 4) return "partial";
  return "fail";
}

export function calculateTotalScore(criteria: CriterionResult[]): number {
  const criteriaMap = new Map(CRITERIA.map((c) => [c.id, c]));

  let weightedSum = 0;
  let maxWeightedSum = 0;

  for (const result of criteria) {
    const meta = criteriaMap.get(result.id);
    if (!meta) continue;
    weightedSum += result.score * meta.weight;
    maxWeightedSum += 10 * meta.weight;
  }

  if (maxWeightedSum === 0) return 0;
  return Math.round((weightedSum / maxWeightedSum) * 100);
}
