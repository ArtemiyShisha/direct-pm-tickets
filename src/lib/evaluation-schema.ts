import { z } from "zod/v4";
import { CRITERIA, type CriterionId } from "./types";

const criterionIds = CRITERIA.map((c) => c.id) as [CriterionId, ...CriterionId[]];

const criterionResultSchema = z.object({
  id: z.enum(criterionIds),
  score: z.number().int().min(0).max(10),
  comment: z.string(),
  recommendation: z.string(),
});

export const evaluationResponseSchema = z.object({
  criteria: z.array(criterionResultSchema).length(CRITERIA.length),
  questions: z.array(z.string()).min(1).max(10),
});

export type EvaluationLLMResponse = z.infer<typeof evaluationResponseSchema>;

export const evaluationJsonSchema = {
  name: "epic_evaluation",
  strict: true,
  schema: {
    type: "object" as const,
    properties: {
      criteria: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            id: {
              type: "string" as const,
              enum: criterionIds,
            },
            score: {
              type: "integer" as const,
              minimum: 0,
              maximum: 10,
            },
            comment: {
              type: "string" as const,
              description:
                "Что именно не хватило для более высокой оценки. Если оценка OK — кратко почему.",
            },
            recommendation: {
              type: "string" as const,
              description: "Конкретная рекомендация по улучшению.",
            },
          },
          required: ["id", "score", "comment", "recommendation"] as const,
          additionalProperties: false,
        },
      },
      questions: {
        type: "array" as const,
        items: { type: "string" as const },
        description:
          "До 10 самых существенных вопросов менеджеру продукта для улучшения эпика.",
      },
    },
    required: ["criteria", "questions"] as const,
    additionalProperties: false,
  },
};
