import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { GROUP_SCHEMAS } from "@/lib/evaluation-schema";
import {
  preAnalysisZodSchema,
  preAnalysisJsonSchema,
} from "@/lib/pre-analysis-schema";
import { buildPreAnalysisPrompt } from "@/prompts/pre-analysis-prompt";
import { buildGroupPrompt } from "@/prompts/system-prompt";
import {
  scoreToStatus,
  calculateTotalScore,
  CRITERIA,
  type CriterionResult,
  type PreAnalysisResult,
} from "@/lib/types";

async function runPreAnalysis(epicText: string): Promise<PreAnalysisResult> {
  const client = getOpenAIClient();
  const systemPrompt = buildPreAnalysisPrompt();

  const response = await client.chat.completions.create({
    model: "gpt-5.4",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Проанализируй следующий эпик:\n\n---\n${epicText}\n---`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: preAnalysisJsonSchema,
    },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Пустой ответ от LLM на этапе Pre-Analysis");
  }

  const parsed = JSON.parse(content);
  return preAnalysisZodSchema.parse(parsed);
}

async function evaluateGroup(
  epicText: string,
  group: (typeof GROUP_SCHEMAS)[number],
  preAnalysis: PreAnalysisResult
) {
  const client = getOpenAIClient();
  const systemPrompt = buildGroupPrompt(group.groupId, preAnalysis);

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

function forceNaCriteria(
  allCriteria: CriterionResult[],
  preAnalysis: PreAnalysisResult
): void {
  for (const naItem of preAnalysis.na_criteria) {
    const criterion = allCriteria.find(
      (c) => c.id === naItem.criterion_id
    );
    if (criterion && criterion.score !== -1) {
      criterion.score = -1;
      criterion.status = "na";
      criterion.comment = `N/A: ${naItem.reason}`;
      criterion.missing_items = [];
      criterion.questions = [];
      criterion.suggestion = null;
    }
  }
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

    // Step 0: Pre-Analysis
    const preAnalysis = await runPreAnalysis(epicText);

    // Steps 1-3: Evaluate groups in parallel with Pre-Analysis context
    const groupResults = await Promise.all(
      GROUP_SCHEMAS.map((group) =>
        evaluateGroup(epicText, group, preAnalysis)
      )
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

    // Force N/A from Pre-Analysis (safety net if LLM ignored instructions)
    forceNaCriteria(allCriteria, preAnalysis);

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
