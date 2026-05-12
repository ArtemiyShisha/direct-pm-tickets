import { describe, expect, it } from "vitest";
import { exportToMarkdown } from "./export-markdown";
import type {
  CriterionResult,
  EvaluationResult,
  ProductChallenge,
} from "./types";

const baseCriterion: Omit<CriterionResult, "id"> = {
  analysis: "",
  found_items: [],
  missing_items: [],
  score: 7,
  status: "ok",
  comment: "ok",
  questions: [],
  suggestion: null,
};

function makeResult(
  product_challenges?: ProductChallenge[],
): EvaluationResult {
  return {
    criteria: [
      { id: "problem", ...baseCriterion },
      { id: "solution", ...baseCriterion },
    ] as CriterionResult[],
    total_score: 75,
    product_challenges,
  };
}

describe("exportToMarkdown", () => {
  it("omits the challenges section when product_challenges is missing", () => {
    const md = exportToMarkdown(makeResult());
    expect(md).not.toContain("Продуктовые челленджи");
  });

  it("omits the challenges section when product_challenges is an empty array", () => {
    const md = exportToMarkdown(makeResult([]));
    expect(md).not.toContain("Продуктовые челленджи");
  });

  it("renders challenges sorted by severity (high → low)", () => {
    const challenges: ProductChallenge[] = [
      {
        type: "question",
        severity: "low",
        target: "Onboarding flow",
        observation: "obs-low",
        direct_context: "ctx-low",
        why_it_matters: "wim-low",
        question: "q-low",
        good_answer: "ga-low",
        related_criteria: [],
        knowledge_card_ids: [],
      },
      {
        type: "risk",
        severity: "high",
        target: "Скопированные кампании",
        observation: "obs-high",
        direct_context: "ctx-high",
        why_it_matters: "wim-high",
        question: "q-high",
        good_answer: "ga-high",
        related_criteria: ["scenarios"],
        knowledge_card_ids: ["entity.campaign"],
      },
    ];
    const md = exportToMarkdown(makeResult(challenges));

    expect(md).toContain("## Продуктовые челленджи");
    expect(md).toContain("### [HIGH] Риск — Скопированные кампании");
    expect(md).toContain("### [LOW] Вопрос — Onboarding flow");
    expect(md).toContain("**Связанные критерии:** Сценарии");
    expect(md).toContain("**Карточки знания:** entity.campaign");

    const highIdx = md.indexOf("### [HIGH]");
    const lowIdx = md.indexOf("### [LOW]");
    expect(highIdx).toBeGreaterThanOrEqual(0);
    expect(lowIdx).toBeGreaterThan(highIdx);
  });

  it("uses «Директ Про» (Cyrillic) in the challenges section header and field labels", () => {
    const challenge: ProductChallenge = {
      type: "question",
      severity: "high",
      target: "Сценарий копирования",
      observation: "Не описан flow для скопированных кампаний.",
      direct_context: "В Директ Про копирование сохраняет ID.",
      why_it_matters: "Иначе сломаются отчёты.",
      question: "Что происходит со связями?",
      good_answer: "Сохранять явный маппинг.",
      related_criteria: [],
      knowledge_card_ids: [],
    };
    const md = exportToMarkdown(makeResult([challenge]));
    expect(md).toContain("в контексте Директ Про");
    expect(md).toContain("**Контекст Директ Про:**");
    expect(md).not.toContain("Direct.Pro");
  });
});
