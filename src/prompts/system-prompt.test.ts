import { describe, expect, it } from "vitest";
import { buildGroupPrompt } from "./system-prompt";
import type { PreAnalysisResult } from "@/lib/types";
import type { DirectProKnowledgeCard } from "@/knowledge/direct-pro/schema";

const preAnalysis: PreAnalysisResult = {
  epic_type: "product_feature",
  product_ids: ["direct_pro"],
  na_criteria: [],
  solution_summary: null,
  product_context_note: "Эпик касается копирования кампаний.",
};

const cardWithRules: DirectProKnowledgeCard = {
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

const cardNoRules: DirectProKnowledgeCard = {
  ...cardWithRules,
  id: "entity.example",
  challengeRules: [],
};

describe("buildGroupPrompt — knowledge cards block", () => {
  it("renders the Direct Pro knowledge block when cards are provided", () => {
    const prompt = buildGroupPrompt("ux", preAnalysis, [cardWithRules]);

    expect(prompt).toContain("КОНТЕКСТ ДИРЕКТ ПРО");
    expect(prompt).toContain("CARD entity.campaign");
    expect(prompt).toContain("kind: entity");
    expect(prompt).toContain("label: Campaign");
    expect(prompt).toContain("summary:");
    expect(prompt).toContain("challenge rules:");
    expect(prompt).toContain(
      "- campaign-change-without-old-new-behavior (high):",
    );
  });

  it("omits the knowledge block when no cards are provided", () => {
    const prompt = buildGroupPrompt("ux", preAnalysis, []);

    expect(prompt).not.toContain("КОНТЕКСТ ДИРЕКТ ПРО");
    expect(prompt).not.toContain("CARD ");
  });

  it("omits the knowledge block when cards argument is undefined (backwards compat)", () => {
    const prompt = buildGroupPrompt("ux", preAnalysis);

    expect(prompt).not.toContain("КОНТЕКСТ ДИРЕКТ ПРО");
  });

  it("does not render a challenge rules subsection for cards without rules", () => {
    const prompt = buildGroupPrompt("technical", preAnalysis, [cardNoRules]);

    expect(prompt).toContain("CARD entity.example");
    expect(prompt).not.toMatch(/CARD entity\.example[\s\S]*challenge rules:/);
  });

  it("instructs the evaluator to ground questions in the knowledge block when present", () => {
    const prompt = buildGroupPrompt("business", preAnalysis, [cardWithRules]);

    expect(prompt).toMatch(/КОНТЕКСТ ДИРЕКТ ПРО/);
    expect(prompt).toMatch(/questions/i);
  });
});
