import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { evaluationJsonSchema, evaluationResponseSchema } from "@/lib/evaluation-schema";
import { SYSTEM_PROMPT } from "@/prompts/system-prompt";
import { scoreToStatus, calculateTotalScore, type CriterionResult } from "@/lib/types";

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

    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: "gpt-5.4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Оцени следующий эпик:\n\n---\n${epicText}\n---`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: evaluationJsonSchema,
      },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Пустой ответ от LLM" },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(content);
    const validated = evaluationResponseSchema.parse(parsed);

    const criteria: CriterionResult[] = validated.criteria.map((c) => ({
      ...c,
      status: scoreToStatus(c.score),
    }));

    const totalScore = calculateTotalScore(criteria);

    return NextResponse.json({
      criteria,
      total_score: totalScore,
      questions: validated.questions,
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
