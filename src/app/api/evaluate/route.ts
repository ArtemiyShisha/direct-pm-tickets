import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient, EVALUATION_MODEL } from "@/lib/openai";
import { GROUP_SCHEMAS } from "@/lib/evaluation-schema";
import {
  preAnalysisZodSchema,
  preAnalysisJsonSchema,
} from "@/lib/pre-analysis-schema";
import {
  productChallengerJsonSchema,
  productChallengerZodSchema,
} from "@/lib/product-challenger-schema";
import { buildPreAnalysisPrompt } from "@/prompts/pre-analysis-prompt";
import { buildGroupPrompt } from "@/prompts/system-prompt";
import { buildProductChallengerPrompt } from "@/prompts/product-challenger-prompt";
import { selectDirectProCards } from "@/knowledge/direct-pro/select";
import {
  scoreToStatus,
  calculateTotalScore,
  CRITERIA,
  type CriterionResult,
  type PreAnalysisResult,
  type ProductChallenge,
} from "@/lib/types";

async function runPreAnalysis(epicText: string): Promise<PreAnalysisResult> {
  const client = getOpenAIClient();
  const systemPrompt = buildPreAnalysisPrompt();

  const response = await client.chat.completions.create({
    model: EVALUATION_MODEL,
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
    model: EVALUATION_MODEL,
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
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error(`Пустой ответ от LLM для группы "${group.label}"`);
  }

  const parsed = JSON.parse(content);
  return group.zodSchema.parse(parsed);
}

async function runProductChallenger(
  epicText: string,
  preAnalysis: PreAnalysisResult,
  criteria: CriterionResult[],
): Promise<ProductChallenge[]> {
  const cards = selectDirectProCards(epicText);
  if (cards.length === 0) return [];

  const client = getOpenAIClient();
  const systemPrompt = buildProductChallengerPrompt(
    preAnalysis,
    criteria,
    cards,
  );

  const response = await client.chat.completions.create({
    model: EVALUATION_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Прочитай эпик и сформулируй продуктовые челленджи:\n\n---\n${epicText}\n---`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: productChallengerJsonSchema,
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Пустой ответ от LLM на этапе Product Challenger");
  }

  return productChallengerZodSchema.parse(JSON.parse(content))
    .product_challenges;
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
  const t0 = Date.now();
  const reqId = Math.random().toString(36).slice(2, 8);
  const stamp = (label: string, extra?: Record<string, unknown>) => {
    const ms = Date.now() - t0;
    console.log(
      `[evaluate ${reqId}] ${label} t+${ms}ms${
        extra ? " " + JSON.stringify(extra) : ""
      }`,
    );
  };

  try {
    const body = await request.json();
    const epicText: string | undefined = body.text;
    stamp("request received", {
      epicLen: epicText?.length ?? 0,
    });

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
    stamp("pre_analysis start");
    const preAnalysis = await runPreAnalysis(epicText);
    stamp("pre_analysis ok", {
      epic_type: preAnalysis.epic_type,
      product_ids: preAnalysis.product_ids.length,
      na: preAnalysis.na_criteria.length,
    });

    // Steps 1-3: Evaluate groups in parallel with Pre-Analysis context
    stamp("groups start", { n: GROUP_SCHEMAS.length });
    const groupResults = await Promise.all(
      GROUP_SCHEMAS.map((group) =>
        evaluateGroup(epicText, group, preAnalysis)
      )
    );
    stamp("groups ok");

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

    forceNaCriteria(allCriteria, preAnalysis);

    const totalScore = calculateTotalScore(allCriteria);

    // Step 4: Product Challenger (best-effort: never fails the whole evaluation)
    stamp("challenger start");
    let productChallenges: ProductChallenge[] = [];
    try {
      productChallenges = await runProductChallenger(
        epicText,
        preAnalysis,
        allCriteria,
      );
      stamp("challenger ok", { challenges: productChallenges.length });
    } catch (challengerError) {
      console.error(`[evaluate ${reqId}] Product Challenger error:`, challengerError);
      stamp("challenger fail (non-fatal)");
    }

    stamp("returning response", { totalScore });
    return NextResponse.json({
      criteria: allCriteria,
      total_score: totalScore,
      product_challenges: productChallenges,
    });
  } catch (error) {
    stamp("FATAL", {
      err: error instanceof Error ? error.message : String(error),
    });
    console.error(`[evaluate ${reqId}] Evaluation error:`, error);

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
