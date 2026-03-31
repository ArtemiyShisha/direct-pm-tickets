import { z } from "zod/v4";
import { CRITERIA, CRITERIA_GROUPS, type CriterionId } from "./types";

export function buildGroupZodSchema(groupCriteriaIds: readonly string[]) {
  const ids = groupCriteriaIds as unknown as [CriterionId, ...CriterionId[]];

  const criterionResultSchema = z.object({
    id: z.enum(ids),
    analysis: z.string(),
    found_items: z.array(z.string()),
    missing_items: z.array(z.string()),
    score: z.number().int().min(-1).max(10),
    comment: z.string(),
    questions: z.array(z.string()),
    suggestion: z.nullable(z.string()),
  });

  return z.object({
    criteria: z.array(criterionResultSchema).length(groupCriteriaIds.length),
  });
}

export function buildGroupJsonSchema(groupCriteriaIds: readonly string[], schemaName: string) {
  return {
    name: schemaName,
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
                enum: groupCriteriaIds,
              },
              analysis: {
                type: "string" as const,
                description:
                  "Chain-of-thought: что нашёл в тексте эпика по этому критерию, какие цитаты, чего не хватает.",
              },
              found_items: {
                type: "array" as const,
                items: { type: "string" as const },
                description:
                  "Список конкретных пунктов, которые НАЙДЕНЫ в тексте эпика по этому критерию. Каждый пункт — короткая фраза.",
              },
              missing_items: {
                type: "array" as const,
                items: { type: "string" as const },
                description:
                  "Список конкретных пунктов, которых НЕ ХВАТАЕТ в тексте эпика по этому критерию. Каждый пункт — короткая фраза.",
              },
              score: {
                type: "integer" as const,
                minimum: -1,
                maximum: 10,
                description:
                  "Оценка 0-10 или -1 если критерий неприменим к данному эпику",
              },
              comment: {
                type: "string" as const,
                description:
                  "Краткий вывод: что не хватило для более высокой оценки. Если оценка OK — почему.",
              },
              questions: {
                type: "array" as const,
                items: { type: "string" as const },
                description:
                  "Вопросы к менеджеру продукта по этому критерию. Пустой массив если вопросов нет.",
              },
              suggestion: {
                type: ["string", "null"] as const,
                description:
                  "Черновик текста для вставки в эпик. null если score = 10, score = -1 или missing_items пуст.",
              },
            },
            required: [
              "id",
              "analysis",
              "found_items",
              "missing_items",
              "score",
              "comment",
              "questions",
              "suggestion",
            ] as const,
            additionalProperties: false,
          },
        },
      },
      required: ["criteria"] as const,
      additionalProperties: false,
    },
  };
}

export const GROUP_SCHEMAS = CRITERIA_GROUPS.map((group) => ({
  groupId: group.id,
  label: group.label,
  criteriaIds: group.criteriaIds,
  zodSchema: buildGroupZodSchema(group.criteriaIds),
  jsonSchema: buildGroupJsonSchema(group.criteriaIds, `eval_${group.id}`),
}));

export type GroupEvaluationResponse = z.infer<
  ReturnType<typeof buildGroupZodSchema>
>;
