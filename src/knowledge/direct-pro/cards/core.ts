import type { DirectProKnowledgeCard } from "../schema";

export const CORE_DIRECT_PRO_CARDS: DirectProKnowledgeCard[] = [
  {
    id: "entity.campaign",
    kind: "entity",
    label: "Campaign",
    aliases: ["campaign", "campaigns", "кампания", "кампании"],
    summary:
      "A campaign is a central Direct.Pro object. Product changes touching campaigns should consider lifecycle, copying, moderation, statistics, and related ad groups.",
    entityLevel: "campaign",
    appliesToCampaignTypes: [],
    surfaces: ["surface.campaign_edit", "surface.campaign_grid"],
    relatedCards: ["entity.ad_group", "action.campaign_copy"],
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
  },
  {
    id: "entity.ad_group",
    kind: "entity",
    label: "Ad group",
    aliases: ["ad group", "group", "groups", "группа", "группы"],
    summary:
      "An ad group is a Direct.Pro object below campaign level. Settings and targeting behavior may live at group level and should not be silently treated as campaign-level behavior.",
    entityLevel: "ad_group",
    appliesToCampaignTypes: [],
    surfaces: ["surface.group_edit", "surface.group_bulk_edit"],
    relatedCards: ["entity.campaign", "entity.ad"],
    challengeRules: [
      {
        id: "group-setting-described-as-campaign-setting",
        trigger:
          "Epic describes a group-level setting as if it were campaign-level.",
        challenge:
          "Ask whether the feature intentionally changes the current object model or should describe behavior for each group.",
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
  },
  {
    id: "entity.ad",
    kind: "entity",
    label: "Ad",
    aliases: ["ad", "ads", "banner", "объявление", "объявления", "баннер"],
    summary:
      "An ad is a Direct.Pro object below ad group level. Product changes touching ad fields should consider moderation, preview, copying, and bulk editing.",
    entityLevel: "ad",
    appliesToCampaignTypes: [],
    surfaces: [
      "surface.ad_edit",
      "surface.ad_preview",
      "surface.ad_bulk_edit",
    ],
    relatedCards: ["entity.ad_group", "integration.moderation"],
    challengeRules: [
      {
        id: "ad-field-without-moderation-behavior",
        trigger:
          "Epic changes ad materials or visible ad fields without moderation behavior.",
        challenge:
          "Ask what happens to moderation status, remoderation, preview, and rejection reasons.",
        severity: "medium",
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
  },
];
