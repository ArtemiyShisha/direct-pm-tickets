import { z } from "zod/v4";

export const knowledgeCardKindSchema = z.enum([
  "campaign_type",
  "entity",
  "setting",
  "surface",
  "tool",
  "integration",
  "role",
  "state",
  "action",
  "failure",
  "concept",
  "legal",
  "adjacent",
  "process",
  "report",
  "asset",
  "placement",
  "format",
  "element",
]);

export const challengeSeveritySchema = z.enum(["high", "medium", "low"]);

export const knowledgeConfidenceSchema = z.enum(["approved", "review_needed"]);

export const entityLevelSchema = z.enum([
  "account",
  "campaign",
  "ad_group",
  "ad",
  "asset",
  "strategy",
  "payer",
  "unknown",
]);

export const challengeRuleSchema = z.object({
  id: z.string().min(1),
  trigger: z.string().min(1),
  challenge: z.string().min(1),
  severity: challengeSeveritySchema,
});

export const sourceRefSchema = z.object({
  label: z.string().min(1),
  location: z.string().min(1),
  reviewedBy: z.string().min(1),
});

export const directProKnowledgeCardSchema = z.object({
  id: z.string().min(1),
  kind: knowledgeCardKindSchema,
  label: z.string().min(1),
  aliases: z.array(z.string().min(1)),
  summary: z.string().min(1),
  entityLevel: entityLevelSchema.optional(),
  appliesToCampaignTypes: z.array(z.string()).default([]),
  surfaces: z.array(z.string()).default([]),
  relatedCards: z.array(z.string()).default([]),
  challengeRules: z.array(challengeRuleSchema).default([]),
  sourceRefs: z.array(sourceRefSchema),
  confidence: knowledgeConfidenceSchema,
});

export type KnowledgeCardKind = z.infer<typeof knowledgeCardKindSchema>;
export type ChallengeSeverity = z.infer<typeof challengeSeveritySchema>;
export type KnowledgeConfidence = z.infer<typeof knowledgeConfidenceSchema>;
export type EntityLevel = z.infer<typeof entityLevelSchema>;
export type ChallengeRule = z.infer<typeof challengeRuleSchema>;
export type SourceRef = z.infer<typeof sourceRefSchema>;
export type DirectProKnowledgeCard = z.infer<typeof directProKnowledgeCardSchema>;
