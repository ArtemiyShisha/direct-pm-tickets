import OpenAI from "openai";

export const EVALUATION_MODEL = "gpt-5.5";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

/**
 * Legacy Product Challenger stage is OFF by default. Direct-Pro knowledge
 * cards are now folded into the group evaluator prompts (`buildGroupPrompt`),
 * so the standalone Challenger LLM call is redundant. Set
 * `PRODUCT_CHALLENGER_ENABLED=true` to keep the old behaviour for comparison.
 */
export function isProductChallengerEnabled(): boolean {
  return process.env.PRODUCT_CHALLENGER_ENABLED === "true";
}
