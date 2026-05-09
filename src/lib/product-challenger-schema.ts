import { z } from "zod/v4";
import { CRITERIA, type CriterionId } from "./types";

const criterionIds = CRITERIA.map((c) => c.id) as [
  CriterionId,
  ...CriterionId[],
];

export const productChallengeSchema = z.object({
  type: z.enum(["question", "risk", "contradiction", "missing_scenario"]),
  severity: z.enum(["high", "medium", "low"]),
  target: z.string(),
  observation: z.string(),
  direct_context: z.string(),
  why_it_matters: z.string(),
  question: z.string(),
  good_answer: z.string(),
  related_criteria: z.array(z.enum(criterionIds)),
  knowledge_card_ids: z.array(z.string()),
});

export const productChallengerZodSchema = z.object({
  product_challenges: z.array(productChallengeSchema).max(12),
});

export const productChallengerJsonSchema = {
  name: "product_challenger",
  strict: true,
  schema: {
    type: "object" as const,
    properties: {
      product_challenges: {
        type: "array" as const,
        maxItems: 12,
        items: {
          type: "object" as const,
          properties: {
            type: {
              type: "string" as const,
              enum: ["question", "risk", "contradiction", "missing_scenario"],
            },
            severity: {
              type: "string" as const,
              enum: ["high", "medium", "low"],
            },
            target: { type: "string" as const },
            observation: { type: "string" as const },
            direct_context: { type: "string" as const },
            why_it_matters: { type: "string" as const },
            question: { type: "string" as const },
            good_answer: { type: "string" as const },
            related_criteria: {
              type: "array" as const,
              items: {
                type: "string" as const,
                enum: CRITERIA.map((c) => c.id),
              },
            },
            knowledge_card_ids: {
              type: "array" as const,
              items: { type: "string" as const },
            },
          },
          required: [
            "type",
            "severity",
            "target",
            "observation",
            "direct_context",
            "why_it_matters",
            "question",
            "good_answer",
            "related_criteria",
            "knowledge_card_ids",
          ] as const,
          additionalProperties: false,
        },
      },
    },
    required: ["product_challenges"] as const,
    additionalProperties: false,
  },
};
