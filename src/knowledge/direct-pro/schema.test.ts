import { describe, expect, it } from "vitest";
import { directProKnowledgeCardSchema } from "./schema";

describe("directProKnowledgeCardSchema", () => {
  it("accepts a setting card with source notes and challenge rules", () => {
    const parsed = directProKnowledgeCardSchema.parse({
      id: "setting.autotargeting",
      kind: "setting",
      label: "Autotargeting",
      aliases: ["autotargeting", "autotargeting setting"],
      summary:
        "Autotargeting is represented as an approved Директ Про setting card.",
      entityLevel: "ad_group",
      appliesToCampaignTypes: ["campaign_type.epk"],
      surfaces: ["surface.group_edit", "tool.api"],
      relatedCards: ["entity.ad_group"],
      challengeRules: [
        {
          id: "autotargeting-level-mismatch",
          trigger: "Epic describes autotargeting as campaign-level behavior.",
          challenge:
            "Check whether the epic intentionally changes the current group-level model or needs group-level behavior described.",
          severity: "high",
        },
      ],
      sourceRefs: [
        {
          label: "approved internal note",
          location: "sanitized",
          reviewedBy: "product-owner",
        },
      ],
      confidence: "approved",
    });

    expect(parsed.id).toBe("setting.autotargeting");
  });

  it("applies array defaults for optional collections", () => {
    const parsed = directProKnowledgeCardSchema.parse({
      id: "entity.account",
      kind: "entity",
      label: "Account",
      aliases: ["account"],
      summary: "Top-level Директ Про account container.",
      sourceRefs: [
        {
          label: "approved skeleton",
          location: "sanitized",
          reviewedBy: "product-owner",
        },
      ],
      confidence: "review_needed",
    });

    expect(parsed.appliesToCampaignTypes).toEqual([]);
    expect(parsed.surfaces).toEqual([]);
    expect(parsed.relatedCards).toEqual([]);
    expect(parsed.challengeRules).toEqual([]);
  });

  it("rejects an unknown kind", () => {
    expect(() =>
      directProKnowledgeCardSchema.parse({
        id: "setting.broken",
        kind: "not-a-real-kind",
        label: "Broken",
        aliases: ["broken"],
        summary: "Invalid kind should not parse.",
        sourceRefs: [
          {
            label: "approved skeleton",
            location: "sanitized",
            reviewedBy: "product-owner",
          },
        ],
        confidence: "review_needed",
      }),
    ).toThrow();
  });

});
