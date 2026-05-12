import { describe, expect, it } from "vitest";
import { buildProductChallengerPrompt } from "./product-challenger-prompt";
import type { CriterionResult, PreAnalysisResult } from "@/lib/types";
import type { DirectProKnowledgeCard } from "@/knowledge/direct-pro/schema";

const preAnalysis: PreAnalysisResult = {
  epic_type: "product_feature",
  product_ids: ["direct_pro"],
  na_criteria: [],
  solution_summary: null,
  product_context_note: "Эпик касается копирования кампаний.",
};

const criteria: CriterionResult[] = [
  {
    id: "scenarios",
    analysis: "x",
    found_items: [],
    missing_items: [],
    score: 8,
    status: "ok",
    comment: "Покрыты основные сценарии.",
    questions: [],
    suggestion: null,
  },
  {
    id: "corner_cases",
    analysis: "x",
    found_items: [],
    missing_items: [],
    score: 5,
    status: "partial",
    comment: "Не описано поведение для скопированных кампаний.",
    questions: [],
    suggestion: null,
  },
];

const card: DirectProKnowledgeCard = {
  id: "entity.campaign",
  kind: "entity",
  label: "Campaign",
  aliases: ["campaign", "кампани"],
  summary:
    "A campaign is a central Директ Про object. Product changes touching campaigns should consider lifecycle, copying, moderation, statistics, and related ad groups.",
  entityLevel: "campaign",
  appliesToCampaignTypes: [],
  surfaces: ["surface.campaign_edit"],
  relatedCards: [],
  challengeRules: [
    {
      id: "campaign-change-without-old-new-behavior",
      trigger:
        "Epic changes campaign behavior but does not distinguish existing and new campaigns.",
      challenge:
        "Ask whether the behavior applies to existing campaigns, new campaigns, copied campaigns, or only after a feature flag is enabled.",
      severity: "high",
    },
  ],
  sourceRefs: [
    {
      label: "approved skeleton",
      location: "sanitized",
      reviewedBy: "product-owner",
    },
  ],
  confidence: "review_needed",
};

describe("buildProductChallengerPrompt", () => {
  it("includes pre-analysis, criteria summary and card block", () => {
    const prompt = buildProductChallengerPrompt(preAnalysis, criteria, [card]);

    expect(prompt).toContain("Директ Про Product Challenger");
    expect(prompt).toContain("epic_type: product_feature");
    expect(prompt).toContain("- scenarios: score=8");
    expect(prompt).toContain(
      "- corner_cases: score=5; status=partial; comment=Не описано поведение для скопированных кампаний.",
    );
    expect(prompt).toContain("CARD entity.campaign");
    expect(prompt).toContain("campaign-change-without-old-new-behavior (high)");
  });

  it("omits the challenge rules section when a card has none", () => {
    const cardWithoutRules: DirectProKnowledgeCard = {
      ...card,
      id: "entity.example",
      challengeRules: [],
    };
    const prompt = buildProductChallengerPrompt(preAnalysis, criteria, [
      cardWithoutRules,
    ]);

    expect(prompt).toContain("CARD entity.example");
    expect(prompt).not.toMatch(/CARD entity\.example[\s\S]*challenge rules:/);
  });

  it("uses «Директ Про» (Cyrillic) in the system prompt header", () => {
    const prompt = buildProductChallengerPrompt(preAnalysis, criteria, [card]);
    expect(prompt).toContain("Директ Про Product Challenger");
    expect(prompt).toContain("в контексте Директ Про");
    expect(prompt).toContain("APPROVED ДИРЕКТ ПРО CARDS:");
    expect(prompt).not.toContain("Direct.Pro");
  });
});
