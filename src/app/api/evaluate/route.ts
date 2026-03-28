import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { GROUP_SCHEMAS } from "@/lib/evaluation-schema";
import { buildGroupPrompt } from "@/prompts/system-prompt";
import {
  scoreToStatus,
  calculateTotalScore,
  CRITERIA,
  type CriterionResult,
} from "@/lib/types";

async function evaluateGroup(
  epicText: string,
  group: (typeof GROUP_SCHEMAS)[number]
) {
  const client = getOpenAIClient();
  const systemPrompt = buildGroupPrompt(group.groupId);

  const response = await client.chat.completions.create({
    model: "gpt-5.4",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Оцени следующий эпик:\n\n---\n${epicText}\n---`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: group.jsonSchema,
    },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error(`Пустой ответ от LLM для группы "${group.label}"`);
  }

  const parsed = JSON.parse(content);
  return group.zodSchema.parse(parsed);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const epicText: string | undefined = body.text;

    if (!epicText || epicText.trim().length === 0) {
      return NextResponse.json(
        { error: "Текст эпика не может быть пустым" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY не настроен" },
        { status: 500 }
      );
    }

    const groupResults = await Promise.all(
      GROUP_SCHEMAS.map((group) => evaluateGroup(epicText, group))
    );

    const criteriaOrder = CRITERIA.map((c) => c.id);

    const allCriteria: CriterionResult[] = groupResults
      .flatMap((result) => result.criteria)
      .map((c) => ({
        ...c,
        status: scoreToStatus(c.score),
      }))
      .sort(
        (a, b) =>
          criteriaOrder.indexOf(a.id) - criteriaOrder.indexOf(b.id)
      );

    const totalScore = calculateTotalScore(allCriteria);

    return NextResponse.json({
      criteria: allCriteria,
      total_score: totalScore,
    });
  } catch (error) {
    console.error("Evaluation error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Ошибка парсинга ответа LLM" },
        { status: 502 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
