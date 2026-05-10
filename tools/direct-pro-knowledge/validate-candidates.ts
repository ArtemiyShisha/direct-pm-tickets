#!/usr/bin/env -S npx --no-install tsx
/**
 * Validate candidate-cards.json for a Direct.Pro source pack.
 *
 * Usage:
 *   npx tsx tools/direct-pro-knowledge/validate-candidates.ts <pack-id>
 *
 * Reads:  knowledge/drafts/<pack-id>/candidate-cards.json
 * Checks:
 *  - file is a JSON array of cards
 *  - each card parses against `directProKnowledgeCardSchema`
 *  - card ids are unique (also relative to already-shipped runtime cards)
 *  - aliases are non-empty unique strings
 *  - sourceRefs is non-empty
 *  - confidence is "review_needed" (drafts must not claim "approved")
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { DIRECT_PRO_KNOWLEDGE_CARDS } from "../../src/knowledge/direct-pro/cards";
import { directProKnowledgeCardSchema } from "../../src/knowledge/direct-pro/schema";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..", "..");

function fail(msg: string): never {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

const packId = process.argv[2];
if (!packId) fail("usage: validate-candidates.ts <pack-id>");

const file = resolve(
  repoRoot,
  "knowledge",
  "drafts",
  packId,
  "candidate-cards.json"
);
if (!existsSync(file)) fail(`candidate-cards.json not found: ${file}`);

const raw = readFileSync(file, "utf-8");
let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch (e) {
  fail(`invalid JSON: ${(e as Error).message}`);
}
if (!Array.isArray(parsed)) fail("candidate-cards.json must be an array");

const seenIds = new Set<string>();
const runtimeIds = new Set(DIRECT_PRO_KNOWLEDGE_CARDS.map((c) => c.id));
const errors: string[] = [];

parsed.forEach((entry, idx) => {
  const result = directProKnowledgeCardSchema.safeParse(entry);
  const id = (entry as { id?: unknown })?.id;
  const tag = typeof id === "string" ? id : `#${idx}`;
  if (!result.success) {
    errors.push(`[${tag}] schema: ${result.error.message}`);
    return;
  }
  const card = result.data;

  if (seenIds.has(card.id)) {
    errors.push(`[${card.id}] duplicate id within draft`);
  }
  seenIds.add(card.id);

  if (runtimeIds.has(card.id)) {
    errors.push(
      `[${card.id}] id collides with already-shipped runtime card`
    );
  }

  if (card.aliases.length === 0) {
    errors.push(`[${card.id}] aliases must be non-empty`);
  }
  const aliasSet = new Set(card.aliases);
  if (aliasSet.size !== card.aliases.length) {
    errors.push(`[${card.id}] aliases contain duplicates`);
  }

  if (card.sourceRefs.length === 0) {
    errors.push(`[${card.id}] sourceRefs must be non-empty`);
  }

  if (card.confidence !== "review_needed") {
    errors.push(
      `[${card.id}] drafts must use confidence: "review_needed", got "${card.confidence}"`
    );
  }

  card.challengeRules.forEach((rule, i) => {
    if (!rule.id || !rule.trigger || !rule.challenge) {
      errors.push(
        `[${card.id}] challengeRules[${i}] missing id/trigger/challenge`
      );
    }
  });
});

if (errors.length) {
  console.error(`Validation failed for pack ${packId}:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `OK: ${parsed.length} candidate cards in pack "${packId}" pass schema validation`
);
console.log(`  ids: ${[...seenIds].join(", ")}`);
