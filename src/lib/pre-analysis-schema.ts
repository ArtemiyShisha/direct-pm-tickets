import { z } from "zod/v4";
import { CRITERIA, EPIC_TYPES, type CriterionId } from "./types";

const criterionIds = CRITERIA.map((c) => c.id) as [CriterionId, ...CriterionId[]];

export const preAnalysisZodSchema = z.object({
  epic_type: z.enum(EPIC_TYPES),
  product_ids: z.array(z.string()),
  na_criteria: z.array(
    z.object({
      criterion_id: z.enum(criterionIds),
      reason: z.string(),
    })
  ),
  solution_summary: z.nullable(z.string()),
  product_context_note: z.string(),
});

export const preAnalysisJsonSchema = {
  name: "pre_analysis",
  strict: true,
  schema: {
    type: "object" as const,
    properties: {
      epic_type: {
        type: "string" as const,
        enum: [...EPIC_TYPES],
        description:
          "Тип эпика: compliance (комплаенс/регуляторика), migration (миграция legacy), product_feature (новая фича/продукт), tech_debt (техдолг), infrastructure (инфраструктура), experiment (эксперимент/A-B тест)",
      },
      product_ids: {
        type: "array" as const,
        items: { type: "string" as const },
        description:
          "Массив id продуктов Яндекс Директа, к которым относится эпик. Если эпик затрагивает всю платформу, включи 'platform'.",
      },
      na_criteria: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            criterion_id: {
              type: "string" as const,
              enum: CRITERIA.map((c) => c.id),
              description: "ID критерия, который неприменим к этому эпику",
            },
            reason: {
              type: "string" as const,
              description: "Краткое обоснование, почему критерий неприменим",
            },
          },
          required: ["criterion_id", "reason"] as const,
          additionalProperties: false,
        },
        description:
          "Критерии, которые НЕПРИМЕНИМЫ к данному эпику и должны получить score = -1 (N/A). Не включай критерии, которые применимы, но плохо описаны.",
      },
      solution_summary: {
        type: ["string", "null"] as const,
        description:
          "Дословная цитата из ВЕРХНЕГО раздела эпика, описывающая суть решения (ответ на 'Что делаем?'). Если такого раздела нет — null.",
      },
      product_context_note: {
        type: "string" as const,
        description:
          "Краткий абзац (2-4 предложения) с контекстом продукта для оценочного промпта: какой продукт, какие интерфейсы есть/нет, какие рынки, что важно учесть при оценке.",
      },
    },
    required: [
      "epic_type",
      "product_ids",
      "na_criteria",
      "solution_summary",
      "product_context_note",
    ] as const,
    additionalProperties: false,
  },
};
