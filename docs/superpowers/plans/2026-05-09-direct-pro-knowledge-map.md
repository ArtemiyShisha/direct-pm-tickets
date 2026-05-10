# Direct.Pro Product Challenger Knowledge Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a safe, reviewable Direct.Pro knowledge map that lets Epic Reviewer raise product-level challenges grounded in Direct.Pro context without shipping raw Arcadia/Wiki dumps or private source paths.

**Architecture:** Separate source intake from runtime knowledge. User-provided PDFs/texts can be committed when explicitly approved, while raw Arcadia/Wiki dumps and local source paths stay local and ignored. A local extraction flow produces candidate cards; humans approve sanitized cards; Railway uses only approved static cards and never reads Arcadia or raw dumps.

**Tech Stack:** Next.js 16 App Router, TypeScript, Zod, OpenAI structured outputs, local Node/Python scripts for extraction, Markdown/YAML or TypeScript for approved knowledge cards.

---

## Implementation Status

> Status as of `ab0bc1a` for Tasks 1-9, 11. Task 10 is iterative (one source pack at a time, human review between batches). Pack `campaign-types-v1` is currently **drafted in `knowledge/drafts/campaign-types-v1/` (gitignored)** and waiting for human review before being promoted into `src/knowledge/direct-pro/cards/campaign-types.ts`.

| Task | Status | Commit |
|------|--------|--------|
| 1. Lock down local knowledge artifact policy | Done | `92277d0` |
| 2. Define the approved knowledge card schema | Done | `fb55907` |
| 3. Add a minimal approved card set (campaign / ad_group / ad) | Done | `e20fe2d` |
| 4. Build card selection for epics | Done | `2a97ad0` |
| 5. Add Product Challenger structured output | Done | `d6d00c5` |
| — Refactor: `EVALUATION_MODEL = "gpt-5.5"` | Done | `6930b05` |
| 6. Build the challenger prompt | Done | `e4f7fa5` |
| 7. Wire challenger into evaluation API | Done | `54f1954` |
| 8. Render challenges in the UI + Markdown export | Done | `30bf5b1` |
| 9. Source intake docs (no adapters yet) | Done | `ab0bc1a` |
| 10. Fill knowledge cards by domain batch | **In progress** — `campaign-types-v1` drafted, awaiting human review (see "How to resume Task 10" below) |
| 11. Human review loop for cards (`card-review-process.md`) | Done | `ab0bc1a` |

### Tooling that exists for Task 10 batches

- `tools/direct-pro-knowledge/extract_pdf_text.py` — PyMuPDF-based PDF → text extractor. Reads `knowledge/drafts/<pack-id>/inputs/`, writes UTF-8 text into `knowledge/drafts/<pack-id>/extracted/`.
- `tools/direct-pro-knowledge/validate-candidates.ts` — Zod-validator for `candidate-cards.json` (schema + id uniqueness vs runtime + drafts must be `review_needed`).
- `.venv-pdf/` — local Python venv with `pymupdf` (gitignored). Recreate with `python3 -m venv .venv-pdf && .venv-pdf/bin/pip install --quiet pymupdf`.
- `baza_znaniy/` — gitignored drop folder for user-provided PDFs. Symlinked from `knowledge/drafts/<pack-id>/inputs/` so the manifest path remains stable.

### Pack `campaign-types-v1` — current state

- Manifest: `docs/knowledge/source-packs/campaign-types-v1/source-pack.yaml` (committed).
- Authoring rules for this batch: `docs/knowledge/source-packs/campaign-types-v1/notes.md` (committed).
- Inputs (gitignored, as symlinks): `knowledge/drafts/campaign-types-v1/inputs/*.pdf` → `baza_znaniy/campaigns/`.
- Extracted text (gitignored): `knowledge/drafts/campaign-types-v1/extracted/*.txt`.
- Drafts (gitignored, validated against `directProKnowledgeCardSchema`):
  - `candidate-cards.json` — 8 cards: `campaign_type.{epk, master_campaigns, simple_start, product_campaign, reach_campaign, thematic_promotion, content_promotion, context_banner}`.
  - `unresolved-questions.md`, `conflicts.md`, `coverage-note.md`.

The next agent in this workstream should **start by reading `coverage-note.md`, `unresolved-questions.md`, `conflicts.md`, and `candidate-cards.json` for `campaign-types-v1` together with the user's review feedback**, then promote whatever the user approves (see "How to resume Task 10" below). Do not author a new pack until `campaign-types-v1` lands in `src/knowledge/direct-pro/cards/`.

### Decisions baked into the implementation

- **LLM model:** all four GPT calls (Pre-Analysis, 3 group evaluators, Product Challenger) share the constant `EVALUATION_MODEL = "gpt-5.5"` in `src/lib/openai.ts`. Bump it in one place if needed.
- **Challenger when no cards match:** if `selectDirectProCards(epicText)` returns `[]`, the Product Challenger LLM call is skipped and `product_challenges: []` is returned. The base per-criterion "Вопросы к PM" still come from the existing pipeline, so a Direct.Pro-irrelevant epic is not left silent — see `src/app/api/evaluate/route.ts`.
- **Test runner:** Vitest is set up with `npm test` / `npm run test:watch`. `vitest.config.ts` mirrors the `@/*` tsconfig path alias.
- **Card confidence floor for runtime:** the three core cards ship with `confidence: "review_needed"`. They are good enough to keep the Challenger from being mute, but they are not "approved" facts. Promotion rules live in `docs/knowledge/card-review-process.md`.
- **Selector aliases:** intentionally narrow ("кампани", "групп", "объявлен", "ad group", " ad ") to avoid false positives on words like "additional". Adding broader aliases speculatively is discouraged — add them with the card that needs them.

### How to resume Task 10 in a fresh session

There are two distinct entry states. Always check first which one you are in.

#### A) A pack is already drafted, waiting for human review (current state for `campaign-types-v1`)

This is the **default situation when you open a fresh session and `knowledge/drafts/<pack-id>/candidate-cards.json` already exists**.

1. Read this plan ("Implementation Status" → "Pack X — current state"), then `docs/knowledge/card-review-process.md`, then `tools/direct-pro-knowledge/README.md` (workflow + validator).
2. Read all four pack outputs in order: `coverage-note.md` (what was covered), `conflicts.md`, `unresolved-questions.md`, finally `candidate-cards.json`. Read the matching `notes.md` and `source-pack.yaml` for authoring rules.
3. Wait for the user's verdict: which cards are approved as-is, which need edits, which are dropped.
4. Re-validate after edits:
   ```bash
   npx tsx tools/direct-pro-knowledge/validate-candidates.ts <pack-id>
   ```
5. **Promote** approved cards into a typed file `src/knowledge/direct-pro/cards/<domain>.ts`. Use the convention `<domain>.ts` matching the pack's domain (e.g. `campaign-types.ts` for `campaign-types-v1`). Steps:
   - Create `src/knowledge/direct-pro/cards/<domain>.ts` exporting a const array typed as `DirectProKnowledgeCard[]`.
   - Add it to `src/knowledge/direct-pro/cards/index.ts` so it joins `DIRECT_PRO_KNOWLEDGE_CARDS`.
   - Aliases must be realistic — keep the ones the draft already chose unless the user said otherwise. Do not broaden the selector speculatively.
   - Confidence stays `"review_needed"` unless the user explicitly signed off as `"approved"` per `card-review-process.md`.
6. Run the full check:
   ```bash
   npx vitest run     # cards/index uniqueness test must stay green
   npm run build      # typecheck + Next.js build
   ```
7. Commit with a message like `feat(knowledge): promote <pack-id> cards`. Optionally push.
8. Only then start the next pack (see B).

The drafts (`candidate-cards.json`, `*.md`, `inputs/`, `extracted/`) stay gitignored after promotion. Do not delete them — they are useful for re-derivation if a card needs to be reverted.

#### B) Starting a fresh pack (no drafts yet)

1. Read this plan, `docs/knowledge/source-packs/README.md`, `docs/knowledge/card-review-process.md`, `tools/direct-pro-knowledge/README.md`.
2. Confirm the next source pack from the batch order in `docs/knowledge/source-packs/README.md`. Ask the user which pack and which input files (usually sanitized PDFs or approved Wiki/text exports).
3. Inputs:
   - If the file is small and approvable for commit → drop into `docs/knowledge/source-packs/<pack-id>/inputs/` (committed).
   - If the file is large or sensitive → drop into `baza_znaniy/<subfolder>/` (gitignored) and create symlinks under `knowledge/drafts/<pack-id>/inputs/` (gitignored). The pack manifest references the symlink path.
4. Set up extraction (only the first time per machine):
   ```bash
   python3 -m venv .venv-pdf && .venv-pdf/bin/pip install --quiet pymupdf
   ```
5. Author the pack:
   - `docs/knowledge/source-packs/<pack-id>/source-pack.yaml` (committed).
   - `docs/knowledge/source-packs/<pack-id>/notes.md` (committed) — authoring rules for the batch.
   - Run `tools/direct-pro-knowledge/extract_pdf_text.py <pack-id>` to get extracted text under `knowledge/drafts/<pack-id>/extracted/`.
   - Read the extracted text and write `candidate-cards.json` + `unresolved-questions.md` + `conflicts.md` + `coverage-note.md` into `knowledge/drafts/<pack-id>/` (all gitignored).
   - Run `npx tsx tools/direct-pro-knowledge/validate-candidates.ts <pack-id>` and fix anything it flags.
6. Stop for human review. After approval, follow the promote steps from path A.

Do not attempt multiple packs in one session; the plan's "Context Management Rules" exist precisely to prevent cross-domain pollution.

---

## Current Findings

- The existing app already has a `Pre-Analysis` step and a small `src/knowledge/direct-context.ts` product catalog.
- That catalog helps with product detection and N/A criteria, but it is not deep enough for Direct.Pro product challenges.
- The Wiki URL `https://wiki.yandex-team.ru/kommercheskijjdepartament/directsupport/directcontent/direct/` did not appear to have a mirrored Markdown/YFM directory in Arcadia when searched via `ya tool cs`.
- Arcadia contains references to that Wiki cluster and a Wiki crawler, but the article text itself appears to live in Wiki.
- The supplied PDF is a 7-page index of the support knowledge base. It is useful as a skeleton, not as detailed product truth.
- The sanitized skeleton is documented in `docs/knowledge/direct-pro-knowledge-skeleton.md`.

## Non-Negotiable Constraints

- Railway must never read Arcadia.
- Raw Wiki exports, Arcadia-derived dumps, private source paths, and unreviewed internal excerpts must not be committed.
- User-provided PDFs/texts can be committed as source material when explicitly approved by the user.
- Do not use `grep`, `rg`, or `find` from Arcadia root. Use `ya tool cs` or approved source adapters.
- Runtime prompts must receive only a small set of relevant approved cards, not an entire Direct.Pro document dump.
- Product facts must be reviewable and correctable by humans before they become runtime knowledge.

## Target Runtime Behavior

Epic Reviewer should keep its existing 14-criteria score. In addition, it should produce product challenges that can appear even when formal criteria are green.

Example shape:

```ts
export interface ProductChallenge {
  type: "question" | "risk" | "contradiction" | "missing_scenario";
  severity: "high" | "medium" | "low";
  target: string;
  observation: string;
  direct_context: string;
  why_it_matters: string;
  question: string;
  good_answer: string;
  related_criteria: CriterionId[];
  knowledge_card_ids: string[];
}
```

## Planned File Structure

- Create `docs/knowledge/direct-pro-knowledge-skeleton.md`  
  Sanitized top-level Direct.Pro/support knowledge taxonomy from the PDF index.

- Create `docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md`  
  This implementation and knowledge-building plan.

- Modify `.gitignore`  
  Exclude local raw/draft extraction artifacts from Arcadia/Wiki while allowing explicitly approved user-provided source files to be committed.

- Create later `src/knowledge/direct-pro/schema.ts`  
  TypeScript types for approved knowledge cards and challenge rules.

- Create later `src/knowledge/direct-pro/cards/*.ts` or `*.json`  
  Sanitized approved runtime cards.

- Create later `src/knowledge/direct-pro/select.ts`  
  Deterministic card selector for matching epic signals to relevant cards.

- Create later `src/prompts/product-challenger-prompt.ts`  
  Prompt builder that receives the epic, pre-analysis, criteria summary, and selected approved cards.

- Create later `src/lib/product-challenger-schema.ts`  
  Zod and JSON Schema for structured challenger output.

- Modify later `src/app/api/evaluate/route.ts`  
  Run Challenger after existing evaluation and include challenges in the API response.

- Modify later `src/lib/types.ts`  
  Add `ProductChallenge` and extend `EvaluationResult`.

- Modify later `src/components/evaluation-result.tsx`  
  Render challenges separately from score while optionally showing related criteria.

- Modify later `src/lib/export-markdown.ts`  
  Include product challenges in Markdown export.

- Create later `tools/direct-pro-knowledge/`  
  Local extractor scripts. These scripts must write Arcadia/Wiki raw outputs only under ignored paths; explicitly approved user-provided PDFs/texts can be stored in tracked docs/source folders.

## Knowledge Ingestion Strategy

Do not try to fill the whole Direct.Pro skeleton in one pass. That will exceed context, mix unrelated domains, and produce cards that are too generic to challenge real epics.

Knowledge ingestion must run as a sequence of small domain batches. Each batch should be independently reviewable and should produce a narrow set of candidate cards plus open questions.

### Source Pack Rule

For every ingestion batch, create or identify one source pack:

```text
source_pack:
  id: campaign-types-v1
  domain: campaign_types
  inputs:
    - user-provided PDF/text file names or approved Wiki page names
  forbidden_inputs:
    - raw Arcadia paths
    - unreviewed Wiki dumps committed to repo
  output:
    - candidate cards
    - unresolved questions
    - source coverage note
```

The worker should load only the files for the current source pack. If a source pack is too large, split it before extraction.

### Batch Order

Start with domains that most often affect epics and challenge quality:

1. **Campaign Types And Product Modes**  
   EPK, Master of Campaigns, Simple Start, mobile app promotion, Telegram, product campaigns, reach campaigns, archived types.

2. **Campaign Hierarchy And Lifecycle**  
   account, campaign, ad group, ad, campaign statuses, start/stop/archive/delete/copy, old vs new campaigns.

3. **Campaign And Group Settings**  
   autotargeting, geo, time targeting, bid adjustments, goals, Metrica, URLs, recommendations, notifications.

4. **Bulk And Professional Surfaces**  
   grids, mass edit, copy, Excel, Commander, API, mobile app, change history.

5. **Targeting And Semantics**  
   keywords, negative phrases, audience segments, retargeting, interests, display conditions, semantic matching.

6. **Moderation And Ad Materials**  
   ad fields, creative assets, preview, moderation statuses, remoderation, rejection reasons.

7. **Billing, Balance, Agencies, And Legal Entities**  
   payers, shared account, VAT, non-residents, agency/subclient relations, legal entity and country constraints.

8. **Reports, Statistics, Metrica, And Optimization**  
   reports, statistics discrepancies, Metrica goals, invalid clicks, optimization flows, post-launch analytics.

9. **Legal, Marking, ORD, Sanctions, And Compliance**  
   ad marking, ERIR, ORD, tokens, documents, sanctions, personal data, legal restrictions.

10. **Support-Only And Adjacent Services**  
   support processes, Yandex Business, advertising subscription, partner office, other Yandex services.

### Batch Output Contract

Every batch must end with:

- approved or review-needed cards for only that batch's domain;
- `unresolved_questions` for facts that sources did not settle;
- `conflicts` when two sources disagree;
- `coverage_note` saying which parts of the skeleton were covered and which were skipped;
- no raw source quotes unless the source file is explicitly approved for commit.

### Context Management Rules

- Load one domain batch at a time.
- Keep source excerpts local to the current extraction turn.
- Prefer more, smaller cards over a single broad card.
- Do not merge cards across domains until both domains are reviewed.
- If a card needs facts from another domain, reference a future card id and add an unresolved question instead of guessing.
- Stop after each batch for human review before continuing.

## Task 1: Lock Down Local Knowledge Artifact Policy

**Files:**
- Modify: `.gitignore`
- Create: `docs/knowledge/direct-pro-knowledge-skeleton.md`
- Create: `docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md`

- [x] **Step 1: Ensure local Arcadia/Wiki raw outputs are ignored**

Add ignore rules:

```gitignore
# local/private knowledge extraction artifacts
/knowledge/arcadia/
/knowledge/wiki-dumps/
/knowledge/drafts/
/knowledge/raw-arcadia/
/knowledge/raw-wiki/
/work/direct-pro-knowledge/
```

- [x] **Step 2: Verify ignore rules**

Run:

```bash
git check-ignore -v knowledge/arcadia/example.md knowledge/wiki-dumps/page.md knowledge/drafts/card.yaml knowledge/raw-arcadia/file.txt knowledge/raw-wiki/wiki.txt work/direct-pro-knowledge/dump.txt
```

Expected: each raw/draft path is matched by `.gitignore`. User-approved source files outside these ignored paths are not ignored by this rule.

- [x] **Step 3: Commit the documentation-only baseline**

Run:

```bash
git add .gitignore docs/knowledge/direct-pro-knowledge-skeleton.md docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md
git commit -m "docs: plan Direct.Pro knowledge map"
```

Expected: a commit containing only documentation and ignore rules.

## Task 2: Define The Approved Knowledge Card Schema

**Files:**
- Create: `src/knowledge/direct-pro/schema.ts`
- Create: `src/knowledge/direct-pro/schema.test.ts`

- [x] **Step 1: Add schema tests**

Create `src/knowledge/direct-pro/schema.test.ts` with examples that represent approved runtime cards:

```ts
import { describe, expect, it } from "vitest";
import { directProKnowledgeCardSchema } from "./schema";

describe("directProKnowledgeCardSchema", () => {
  it("accepts a setting card with source notes and challenge rules", () => {
    const parsed = directProKnowledgeCardSchema.parse({
      id: "setting.autotargeting",
      kind: "setting",
      label: "Autotargeting",
      aliases: ["autotargeting", "autotargeting setting"],
      summary: "Autotargeting is represented as an approved Direct.Pro setting card.",
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
});
```

- [x] **Step 2: Add schema implementation**

Create `src/knowledge/direct-pro/schema.ts`:

```ts
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
  entityLevel: z
    .enum(["account", "campaign", "ad_group", "ad", "asset", "strategy", "payer", "unknown"])
    .optional(),
  appliesToCampaignTypes: z.array(z.string()).default([]),
  surfaces: z.array(z.string()).default([]),
  relatedCards: z.array(z.string()).default([]),
  challengeRules: z.array(challengeRuleSchema).default([]),
  sourceRefs: z.array(sourceRefSchema),
  confidence: knowledgeConfidenceSchema,
});

export type DirectProKnowledgeCard = z.infer<typeof directProKnowledgeCardSchema>;
```

- [x] **Step 3: Run schema tests**

Run:

```bash
npm test -- src/knowledge/direct-pro/schema.test.ts
```

Done: Vitest is installed and `npm test` / `npm run test:watch` are wired in `package.json`. `vitest.config.ts` mirrors the `@/*` tsconfig path alias so tests in `src/**` can import via `@/lib/...` and `@/knowledge/...`.

## Task 3: Add A Minimal Approved Card Set

**Files:**
- Create: `src/knowledge/direct-pro/cards/core.ts`
- Create: `src/knowledge/direct-pro/cards/index.ts`
- Create: `src/knowledge/direct-pro/cards/index.test.ts`

- [x] **Step 1: Add tests for card uniqueness**

Create `src/knowledge/direct-pro/cards/index.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DIRECT_PRO_KNOWLEDGE_CARDS } from "./index";

describe("DIRECT_PRO_KNOWLEDGE_CARDS", () => {
  it("contains unique card ids", () => {
    const ids = DIRECT_PRO_KNOWLEDGE_CARDS.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains cards for the core campaign hierarchy", () => {
    expect(DIRECT_PRO_KNOWLEDGE_CARDS.map((card) => card.id)).toEqual(
      expect.arrayContaining(["entity.campaign", "entity.ad_group", "entity.ad"])
    );
  });
});
```

- [x] **Step 2: Add a minimal sanitized card file**

Create `src/knowledge/direct-pro/cards/core.ts`:

```ts
import type { DirectProKnowledgeCard } from "../schema";

export const CORE_DIRECT_PRO_CARDS: DirectProKnowledgeCard[] = [
  {
    id: "entity.campaign",
    kind: "entity",
    label: "Campaign",
    aliases: ["campaign", "campaigns"],
    summary:
      "A campaign is a central Direct.Pro object. Product changes touching campaigns should consider lifecycle, copying, moderation, statistics, and related ad groups.",
    entityLevel: "campaign",
    appliesToCampaignTypes: [],
    surfaces: ["surface.campaign_edit", "surface.campaign_grid"],
    relatedCards: ["entity.ad_group", "action.campaign_copy"],
    challengeRules: [
      {
        id: "campaign-change-without-old-new-behavior",
        trigger: "Epic changes campaign behavior but does not distinguish existing and new campaigns.",
        challenge:
          "Ask whether the behavior applies to existing campaigns, new campaigns, copied campaigns, or only after a feature flag is enabled.",
        severity: "high",
      },
    ],
    sourceRefs: [{ label: "approved skeleton", location: "sanitized", reviewedBy: "product-owner" }],
    confidence: "review_needed",
  },
  {
    id: "entity.ad_group",
    kind: "entity",
    label: "Ad group",
    aliases: ["ad group", "group", "groups"],
    summary:
      "An ad group is a Direct.Pro object below campaign level. Settings and targeting behavior may live at group level and should not be silently treated as campaign-level behavior.",
    entityLevel: "ad_group",
    appliesToCampaignTypes: [],
    surfaces: ["surface.group_edit", "surface.group_bulk_edit"],
    relatedCards: ["entity.campaign", "entity.ad"],
    challengeRules: [
      {
        id: "group-setting-described-as-campaign-setting",
        trigger: "Epic describes a group-level setting as if it were campaign-level.",
        challenge:
          "Ask whether the feature intentionally changes the current object model or should describe behavior for each group.",
        severity: "high",
      },
    ],
    sourceRefs: [{ label: "approved skeleton", location: "sanitized", reviewedBy: "product-owner" }],
    confidence: "review_needed",
  },
  {
    id: "entity.ad",
    kind: "entity",
    label: "Ad",
    aliases: ["ad", "ads", "banner"],
    summary:
      "An ad is a Direct.Pro object below ad group level. Product changes touching ad fields should consider moderation, preview, copying, and bulk editing.",
    entityLevel: "ad",
    appliesToCampaignTypes: [],
    surfaces: ["surface.ad_edit", "surface.ad_preview", "surface.ad_bulk_edit"],
    relatedCards: ["entity.ad_group", "integration.moderation"],
    challengeRules: [
      {
        id: "ad-field-without-moderation-behavior",
        trigger: "Epic changes ad materials or visible ad fields without moderation behavior.",
        challenge:
          "Ask what happens to moderation status, remoderation, preview, and rejection reasons.",
        severity: "medium",
      },
    ],
    sourceRefs: [{ label: "approved skeleton", location: "sanitized", reviewedBy: "product-owner" }],
    confidence: "review_needed",
  },
];
```

- [x] **Step 3: Export cards**

Create `src/knowledge/direct-pro/cards/index.ts`:

```ts
import { CORE_DIRECT_PRO_CARDS } from "./core";

export const DIRECT_PRO_KNOWLEDGE_CARDS = [...CORE_DIRECT_PRO_CARDS] as const;
```

## Task 4: Build Card Selection For Epics

**Files:**
- Create: `src/knowledge/direct-pro/select.ts`
- Create: `src/knowledge/direct-pro/select.test.ts`

- [x] **Step 1: Add selector tests**

Create `src/knowledge/direct-pro/select.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { selectDirectProCards } from "./select";

describe("selectDirectProCards", () => {
  it("selects group-related cards when an epic mentions groups", () => {
    const cards = selectDirectProCards("Нужно массово изменить настройки групп объявлений.");
    expect(cards.map((card) => card.id)).toContain("entity.ad_group");
  });

  it("selects campaign-related cards when an epic mentions campaigns", () => {
    const cards = selectDirectProCards("Добавляем новую настройку кампании в Директ Про.");
    expect(cards.map((card) => card.id)).toContain("entity.campaign");
  });
});
```

- [x] **Step 2: Add selector implementation**

Create `src/knowledge/direct-pro/select.ts`:

```ts
import { DIRECT_PRO_KNOWLEDGE_CARDS } from "./cards";
import type { DirectProKnowledgeCard } from "./schema";

function normalize(text: string): string {
  return text.toLocaleLowerCase("ru-RU");
}

export function selectDirectProCards(epicText: string): DirectProKnowledgeCard[] {
  const normalized = normalize(epicText);

  return DIRECT_PRO_KNOWLEDGE_CARDS.filter((card) =>
    card.aliases.some((alias) => normalized.includes(normalize(alias)))
  );
}
```

## Task 5: Add Product Challenger Structured Output

**Files:**
- Create: `src/lib/product-challenger-schema.ts`
- Modify: `src/lib/types.ts`

- [x] **Step 1: Add types**

Modify `src/lib/types.ts`:

```ts
export interface ProductChallenge {
  type: "question" | "risk" | "contradiction" | "missing_scenario";
  severity: "high" | "medium" | "low";
  target: string;
  observation: string;
  direct_context: string;
  why_it_matters: string;
  question: string;
  good_answer: string;
  related_criteria: CriterionId[];
  knowledge_card_ids: string[];
}

export interface EvaluationResult {
  criteria: CriterionResult[];
  total_score: number;
  product_challenges?: ProductChallenge[];
}
```

- [x] **Step 2: Add Zod and JSON Schema**

Create `src/lib/product-challenger-schema.ts`:

```ts
import { z } from "zod/v4";
import { CRITERIA, type CriterionId } from "./types";

const criterionIds = CRITERIA.map((c) => c.id) as [CriterionId, ...CriterionId[]];

export const productChallengeSchema = z.object({
  type: z.enum(["question", "risk", "contradiction", "missing_scenario"]),
  severity: z.enum(["high", "medium", "low"]),
  target: z.string(),
  observation: z.string(),
  direct_context: z.string(),
  why_it_matters: z.string(),
  question: z.string(),
  good_answer: z.string(),
  related_criteria: z.array(z.enum(criterionIds)),
  knowledge_card_ids: z.array(z.string()),
});

export const productChallengerZodSchema = z.object({
  product_challenges: z.array(productChallengeSchema).max(12),
});

export const productChallengerJsonSchema = {
  name: "product_challenger",
  strict: true,
  schema: {
    type: "object" as const,
    properties: {
      product_challenges: {
        type: "array" as const,
        maxItems: 12,
        items: {
          type: "object" as const,
          properties: {
            type: { type: "string" as const, enum: ["question", "risk", "contradiction", "missing_scenario"] },
            severity: { type: "string" as const, enum: ["high", "medium", "low"] },
            target: { type: "string" as const },
            observation: { type: "string" as const },
            direct_context: { type: "string" as const },
            why_it_matters: { type: "string" as const },
            question: { type: "string" as const },
            good_answer: { type: "string" as const },
            related_criteria: { type: "array" as const, items: { type: "string" as const, enum: CRITERIA.map((c) => c.id) } },
            knowledge_card_ids: { type: "array" as const, items: { type: "string" as const } },
          },
          required: [
            "type",
            "severity",
            "target",
            "observation",
            "direct_context",
            "why_it_matters",
            "question",
            "good_answer",
            "related_criteria",
            "knowledge_card_ids",
          ] as const,
          additionalProperties: false,
        },
      },
    },
    required: ["product_challenges"] as const,
    additionalProperties: false,
  },
};
```

## Task 6: Build The Challenger Prompt

**Files:**
- Create: `src/prompts/product-challenger-prompt.ts`

- [x] **Step 1: Add prompt builder**

Create `src/prompts/product-challenger-prompt.ts`:

```ts
import type { CriterionResult, PreAnalysisResult } from "@/lib/types";
import type { DirectProKnowledgeCard } from "@/knowledge/direct-pro/schema";

export function buildProductChallengerPrompt(
  preAnalysis: PreAnalysisResult,
  criteria: CriterionResult[],
  cards: DirectProKnowledgeCard[]
): string {
  const criteriaSummary = criteria
    .map((criterion) => `- ${criterion.id}: score=${criterion.score}; comment=${criterion.comment}`)
    .join("\n");

  const cardBlock = cards
    .map(
      (card) => `CARD ${card.id}
kind: ${card.kind}
summary: ${card.summary}
challenge rules:
${card.challengeRules.map((rule) => `- ${rule.id}: ${rule.challenge}`).join("\n")}`
    )
    .join("\n\n");

  return `Ты — Direct.Pro Product Challenger. Ты не ставишь оценку и не пересчитываешь score.

Твоя задача — найти вопросы, риски и противоречия к самой продуктовой идее в контексте Direct.Pro.
Челлендж может появиться даже если формальные критерии получили высокий score.

Используй только:
- текст эпика;
- автоматический pre-analysis;
- summary оценок;
- approved Direct.Pro knowledge cards ниже.

Не выдумывай факты о Direct.Pro сверх карточек. Если знания не хватает, формулируй вопрос как проверку допущения.

PRE-ANALYSIS:
- epic_type: ${preAnalysis.epic_type}
- product_ids: ${preAnalysis.product_ids.join(", ")}
- context: ${preAnalysis.product_context_note}

CRITERIA SUMMARY:
${criteriaSummary}

APPROVED DIRECT.PRO CARDS:
${cardBlock}`;
}
```

## Task 7: Wire Challenger Into Evaluation API

**Files:**
- Modify: `src/app/api/evaluate/route.ts`
- Modify: `src/lib/types.ts`

- [x] **Step 1: Add `runProductChallenger` after the current group evaluations**

Implementation shape:

```ts
async function runProductChallenger(
  epicText: string,
  preAnalysis: PreAnalysisResult,
  criteria: CriterionResult[]
): Promise<ProductChallenge[]> {
  const cards = selectDirectProCards(epicText);
  if (cards.length === 0) return [];

  const client = getOpenAIClient();
  const systemPrompt = buildProductChallengerPrompt(preAnalysis, criteria, cards);

  const response = await client.chat.completions.create({
    model: EVALUATION_MODEL, // EVALUATION_MODEL = "gpt-5.5" — см. src/lib/openai.ts
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Прочитай эпик и сформулируй продуктовые челленджи:\n\n---\n${epicText}\n---` },
    ],
    response_format: {
      type: "json_schema",
      json_schema: productChallengerJsonSchema,
    },
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Пустой ответ от LLM на этапе Product Challenger");
  }

  return productChallengerZodSchema.parse(JSON.parse(content)).product_challenges;
}
```

- [x] **Step 2: Return challenges without changing `total_score`**

Add to the JSON response:

```ts
const productChallenges = await runProductChallenger(epicText, preAnalysis, allCriteria);

return NextResponse.json({
  criteria: allCriteria,
  total_score: totalScore,
  product_challenges: productChallenges,
});
```

## Task 8: Render Challenges In The UI

**Files:**
- Modify: `src/components/evaluation-result.tsx`
- Modify: `src/lib/export-markdown.ts`

- [x] **Step 1: Add a compact challenge section**

Render product challenges below the score summary and above criterion groups. Use severity labels and related criteria badges. Do not imply that challenges reduce score.

- [x] **Step 2: Add Markdown export**

Append:

```md
## Product Challenges

### [severity] [target]

**Observation:** ...
**Direct context:** ...
**Why it matters:** ...
**Question:** ...
**Good answer:** ...
```

## Task 9: Build Local Source Intake Later

**Files:**
- Create later: `tools/direct-pro-knowledge/README.md`
- Create later: `tools/direct-pro-knowledge/extract-from-wiki.ts`
- Create later: `tools/direct-pro-knowledge/prompts/extract-card.md`
- Create later: `docs/knowledge/source-packs/README.md`

- [x] **Step 1: Document source rules**

The tool README must state:

```md
Raw Arcadia/Wiki dumps are local-only. Do not commit files from knowledge/arcadia, knowledge/wiki-dumps, knowledge/raw-arcadia, knowledge/raw-wiki, knowledge/drafts, or work/direct-pro-knowledge.
User-provided PDFs/texts may be committed as source material only when explicitly approved.
Railway must use only approved sanitized cards from src/knowledge/direct-pro/cards.
```

- [x] **Step 2: Implement source adapters only after source access is settled**

(No adapters implemented yet — by design. The README in `tools/direct-pro-knowledge/` lists the candidate adapters and the conditions for picking one when Task 10 needs it.)

Candidate adapters:

- Wiki API/crawler using `WIKI_TOKEN`;
- `ya tool cs` only for locating references, not for crawling Arcadia;
- manual PDF/text drop into a tracked source folder when the user explicitly approves committing those files; otherwise use ignored local paths.

- [x] **Step 3: Document source pack manifests**

Create `docs/knowledge/source-packs/README.md`:

```md
# Direct.Pro Source Packs

Source packs are small, reviewable input groups for knowledge extraction. Do not extract cards from the entire source corpus at once.

Each source pack must define:

- `id`
- `domain`
- `input_files`
- `expected_card_kinds`
- `out_of_scope`
- `review_owner`

Suggested batch order:

1. campaign-types-v1
2. campaign-hierarchy-lifecycle-v1
3. campaign-group-settings-v1
4. bulk-professional-surfaces-v1
5. targeting-semantics-v1
6. moderation-ad-materials-v1
7. billing-agency-legal-entities-v1
8. reports-statistics-optimization-v1
9. legal-marking-compliance-v1
10. support-adjacent-services-v1
```

## Task 10: Fill Knowledge Cards By Domain Batch

**Files:**
- Create later: `src/knowledge/direct-pro/cards/campaign-types.ts`
- Create later: `src/knowledge/direct-pro/cards/campaign-hierarchy.ts`
- Create later: `src/knowledge/direct-pro/cards/settings.ts`
- Create later: `src/knowledge/direct-pro/cards/professional-surfaces.ts`
- Create later: `src/knowledge/direct-pro/cards/targeting.ts`
- Create later: `src/knowledge/direct-pro/cards/moderation.ts`
- Create later: `src/knowledge/direct-pro/cards/billing-agency.ts`
- Create later: `src/knowledge/direct-pro/cards/statistics.ts`
- Create later: `src/knowledge/direct-pro/cards/legal-compliance.ts`
- Create later: `src/knowledge/direct-pro/cards/support-adjacent.ts`

- [ ] **Step 1: Fill campaign types first**

Input: source pack `campaign-types-v1`.

Output cards should cover campaign/product modes only. Do not include detailed settings unless needed as references.

Expected initial card ids:

```text
campaign_type.epk
campaign_type.master_campaigns
campaign_type.simple_start
campaign_type.mobile_app_promotion
campaign_type.telegram_ads
campaign_type.product_campaign
campaign_type.reach_campaign
campaign_type.dooh
campaign_type.context_banner
campaign_type.dynamic_ads
campaign_type.smart_banners
```

- [ ] **Step 2: Fill campaign hierarchy and lifecycle**

Input: source pack `campaign-hierarchy-lifecycle-v1`.

Expected initial card ids:

```text
entity.account
entity.campaign
entity.ad_group
entity.ad
state.campaign_status
action.campaign_start_stop
action.campaign_archive
action.campaign_delete
action.campaign_copy
action.campaign_send_to_moderation
```

- [ ] **Step 3: Fill campaign and group settings**

Input: source pack `campaign-group-settings-v1`.

Expected initial card ids:

```text
setting.autotargeting
setting.geo_targeting
setting.time_targeting
setting.bid_adjustments
setting.blocked_placements
setting.url_parameters
setting.metrica_counter
setting.target_actions
setting.strategy
setting.average_daily_budget
```

- [ ] **Step 4: Fill professional surfaces**

Input: source pack `bulk-professional-surfaces-v1`.

Expected initial card ids:

```text
surface.campaign_grid
surface.group_grid
surface.ad_grid
action.bulk_edit
action.copy
tool.api
tool.commander
tool.excel
tool.change_history
tool.mobile_app
```

- [ ] **Step 5: Continue one domain batch at a time**

Continue in the documented batch order. Each batch must be reviewed before starting the next one.

Do not start `Product Challenger` runtime integration until at least the first four batches have review-needed or approved cards.

## Task 11: Human Review Loop For Cards

**Files:**
- Create later: `docs/knowledge/card-review-process.md`

- [x] **Step 1: Define card states**

Use:

```text
draft -> review_needed -> approved -> deprecated
```

- [x] **Step 2: Define approval criteria**

A card can be `approved` only when:

- it contains no raw internal quotes;
- the fact is understandable without private source text;
- at least one product owner or domain expert reviewed it;
- challenge rules are phrased as questions or risks, not as unsupported claims;
- the card can be safely sent to the LLM from Railway.

## Open Questions

### Resolved during implementation

- **Test runner.** Vitest added in Task 2 (commit `fb55907`). `vitest.config.ts` resolves the `@/*` alias from tsconfig.
- **UI label for the new block.** Rendered as "Продуктовые челленджи" with an explicit "Не влияют на оценку" caption (Task 8, commit `30bf5b1`).
- **Source adapter to start with.** None implemented yet. The current consensus is to start with **manual PDF/text drop** (cheapest, no auth, the file can be reviewed before commit). Wiki API / `ya tool cs` lookups deferred until access and the next batch's scope are settled. See `tools/direct-pro-knowledge/README.md`.
- **`sourceRefs` discipline.** Resolved in `docs/knowledge/card-review-process.md`: `label` is a human-readable hint, `location` is a non-secret pointer (`"sanitized"` or an in-repo path under `docs/knowledge/source-packs/<pack-id>/inputs/<file>`), `reviewedBy` is the reviewer handle/role. No raw source text in any field.
- **GPT model.** Centralized in `EVALUATION_MODEL = "gpt-5.5"` (commit `6930b05`); same model is used by all four LLM calls.

### Still open (defer to Task 10 batches)

- **Which approved/sanitized facts are allowed to be sent to OpenAI from Railway?** The card schema treats every `approved` card as safe to send, but the rule for `review_needed` cards is "best-effort: still goes to runtime, but phrased as a question". Reconfirm during each domain batch in case some domains (e.g. legal, billing) need a stricter gate.
- **Selector breadth.** Three core entity cards mean Challenger fires only on epics that mention campaigns / groups / ads. After the first 2-3 Task 10 batches the alias coverage will broaden naturally; revisit whether the substring matcher needs to grow into something more structured (e.g. token-level matcher, lemmatizer) only when we see real false negatives.

## Verification

For documentation-only work:

```bash
git status --short
git diff -- .gitignore docs/knowledge/direct-pro-knowledge-skeleton.md docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md
```

For future implementation:

```bash
npm run lint
npm run build
```

If tests are added:

```bash
npm test
```
