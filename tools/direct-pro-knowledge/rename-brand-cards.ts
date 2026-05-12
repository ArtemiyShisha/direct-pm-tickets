#!/usr/bin/env tsx
/**
 * One-shot rename: Direct.Pro → Директ Про across user-facing fields of
 * src/knowledge/direct-pro/cards/*.json.
 *
 * Whitelisted fields (per directProKnowledgeCardSchema):
 *   label, summary, aliases[], challengeRules[].trigger,
 *   challengeRules[].challenge.
 *
 * NOT touched:
 *   id, kind, entityLevel, appliesToCampaignTypes, surfaces, relatedCards,
 *   challengeRules[].id, challengeRules[].severity, sourceRefs[].* (formal
 *   source labels and file paths), confidence.
 *
 * Idempotent. Run via:
 *   npx tsx tools/direct-pro-knowledge/rename-brand-cards.ts
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renameBrandText } from "../../src/lib/brand-rename";

interface ChallengeRule {
  id: string;
  trigger: string;
  challenge: string;
  severity: string;
}

interface Card {
  id: string;
  label: string;
  aliases: string[];
  summary: string;
  challengeRules?: ChallengeRule[];
  [key: string]: unknown;
}

const CARDS_DIR = "src/knowledge/direct-pro/cards";

function transformCard(card: Card): { card: Card; changes: number } {
  let changes = 0;
  const wrap = (value: string): string => {
    const next = renameBrandText(value);
    if (next !== value) changes += 1;
    return next;
  };

  card.label = wrap(card.label);
  card.summary = wrap(card.summary);
  card.aliases = card.aliases.map(wrap);
  if (card.challengeRules) {
    card.challengeRules = card.challengeRules.map((rule) => ({
      ...rule,
      trigger: wrap(rule.trigger),
      challenge: wrap(rule.challenge),
    }));
  }
  return { card, changes };
}

function main(): void {
  const files = readdirSync(CARDS_DIR).filter((name) => name.endsWith(".json"));
  for (const name of files) {
    const path = join(CARDS_DIR, name);
    const cards = JSON.parse(readFileSync(path, "utf8")) as Card[];
    let total = 0;
    const next = cards.map((c) => {
      const { card, changes } = transformCard(c);
      total += changes;
      return card;
    });
    writeFileSync(path, JSON.stringify(next, null, 2) + "\n");
    console.log(`${name}: ${total} field(s) updated`);
  }
}

main();
