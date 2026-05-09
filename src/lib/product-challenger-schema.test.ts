import { describe, expect, it } from "vitest";
import {
  productChallengeSchema,
  productChallengerJsonSchema,
  productChallengerZodSchema,
} from "./product-challenger-schema";

describe("productChallengeSchema", () => {
  it("accepts a fully populated challenge", () => {
    const parsed = productChallengeSchema.parse({
      type: "risk",
      severity: "high",
      target: "Кампания после копирования",
      observation: "Эпик не описывает, как ведут себя скопированные кампании.",
      direct_context: "Копирование кампании обнуляет накопленные показатели.",
      why_it_matters: "Возможна потеря CTR-приоритета фраз после копии.",
      question: "Что происходит со скопированными кампаниями после релиза?",
      good_answer: "Поведение для копий явно описано в эпике.",
      related_criteria: ["scenarios", "corner_cases"],
      knowledge_card_ids: ["entity.campaign"],
    });
    expect(parsed.type).toBe("risk");
  });

  it("rejects an unknown criterion id in related_criteria", () => {
    expect(() =>
      productChallengeSchema.parse({
        type: "question",
        severity: "low",
        target: "Whatever",
        observation: "x",
        direct_context: "x",
        why_it_matters: "x",
        question: "x",
        good_answer: "x",
        related_criteria: ["definitely_not_a_real_criterion"],
        knowledge_card_ids: [],
      }),
    ).toThrow();
  });
});

describe("productChallengerZodSchema", () => {
  it("caps product_challenges to 12 items", () => {
    const challenge = {
      type: "question" as const,
      severity: "low" as const,
      target: "x",
      observation: "x",
      direct_context: "x",
      why_it_matters: "x",
      question: "x",
      good_answer: "x",
      related_criteria: [],
      knowledge_card_ids: [],
    };

    expect(() =>
      productChallengerZodSchema.parse({
        product_challenges: Array.from({ length: 13 }, () => challenge),
      }),
    ).toThrow();
  });
});

describe("productChallengerJsonSchema", () => {
  it("declares strict mode and required top-level fields", () => {
    expect(productChallengerJsonSchema.strict).toBe(true);
    expect(productChallengerJsonSchema.schema.required).toEqual([
      "product_challenges",
    ]);
    expect(productChallengerJsonSchema.schema.additionalProperties).toBe(false);
  });
});
