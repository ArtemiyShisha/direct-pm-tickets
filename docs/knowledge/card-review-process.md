# Direct.Pro Card Review Process

Approved Direct.Pro knowledge cards are the **only** source of truth that reaches the Railway runtime. This document defines how a card moves from a raw extractor draft to runtime use.

## Card States

```text
draft -> review_needed -> approved -> deprecated
```

| State | Where it lives | What it means |
|-------|-----------------|---------------|
| `draft` | `knowledge/drafts/<pack-id>/candidate-cards.json` (gitignored) | Auto-generated from a source pack, not yet seen by a human reviewer. |
| `review_needed` | `src/knowledge/direct-pro/cards/<domain>.ts` with `confidence: "review_needed"` | A reviewer has read the card and decided it is good enough to ship to runtime as best-effort, but it has not been signed off as a verified product fact. |
| `approved` | `src/knowledge/direct-pro/cards/<domain>.ts` with `confidence: "approved"` | Verified by a product owner / domain expert. Safe to surface in product challenges as a stated fact (still phrased as a check, not as ground truth). |
| `deprecated` | Removed from the cards array, or kept with a clear deprecation tag (TBD) | The fact no longer holds; replaced or no longer relevant. |

`draft` cards never reach runtime. The selector and the prompt builder only see what's exported from `src/knowledge/direct-pro/cards/index.ts`, which only contains files that have already cleared at least the `review_needed` bar.

## Promotion: `draft` → `review_needed`

A reviewer takes a draft and either edits it inline or rejects it.

A draft can be promoted to `review_needed` only when:

- The card is conceptually a **single, narrow** fact about Direct.Pro. If it tries to describe two unrelated entities, split it.
- The card uses **no raw quoted internal text**. Summaries are fine; copy-pasted Wiki paragraphs are not.
- All required fields parse against `directProKnowledgeCardSchema`.
- `aliases` are realistic — words the PM is likely to use in an epic, not the card's internal id.
- `challengeRules` are phrased as **questions or risks**, not as unsupported claims.
- `entityLevel` and `appliesToCampaignTypes` are accurate or empty (do not invent applicability).
- The card adds value relative to existing cards in the same domain (no near-duplicates).

When promoted, the card is added to the appropriate file under `src/knowledge/direct-pro/cards/<domain>.ts` and exported through `index.ts`. Tests for unique ids and schema conformance must still pass.

## Promotion: `review_needed` → `approved`

A card may flip its `confidence` to `"approved"` only when **all** of the following are true:

- The card contains no raw internal quotes.
- The fact is understandable without the original private source text.
- At least one **product owner** or **domain expert** has reviewed it (initials in the PR or a sign-off note).
- Challenge rules are still phrased as questions or risks, not unsupported claims.
- The card is safe to send to OpenAI from Railway: no internal-only paths, ticket numbers, customer names, or tokens.
- The card's `summary` and `direct_context`-style content reads as a self-contained statement that an external LLM can use without leaking secrets.

Approval is recorded by changing `confidence: "review_needed"` to `confidence: "approved"` in code and including the reviewer's handle in the commit message (e.g. `Co-reviewed-by: <handle>` or a Reviewers list in the PR).

## Demotion: `approved` → `review_needed` or `deprecated`

If a fact becomes uncertain (product change, contradicting source, support escalation):

- Lower `confidence` back to `"review_needed"` immediately and add a note in `challengeRules[].challenge` so the runtime keeps it as a question, not as a claim.
- If the fact is wrong, mark the card for deprecation. Either remove it (preferred when nothing depends on the id) or replace its content with a deprecation marker (TBD when we add a `deprecated` flag).

## Authoring Hygiene

For everyone editing cards:

- One PR per domain batch (campaign-types-v1, campaign-hierarchy-lifecycle-v1, ...). Don't mix batches.
- Don't merge a batch with new cards if `npx vitest run` or `npm run build` is red.
- Don't add cards from outside the current batch's domain even if "you noticed it on the way" — log it as an unresolved question and pick it up in the right batch.
- Don't extend `selectDirectProCards` aliases speculatively. Aliases are added together with the card that needs them, so we don't get phantom matches.

## Source Trail Without Source Leakage

`sourceRefs` is the single channel for traceability. Each entry is `{ label, location, reviewedBy }`. None of these fields should contain a copy of the underlying private text. Use:

- `label` for human-readable hint (e.g. `"approved internal note"`, `"PDF support knowledge index"`).
- `location` for a non-secret pointer (`"sanitized"`, `"docs/knowledge/source-packs/<pack-id>/inputs/<file>"`).
- `reviewedBy` for the reviewer (handle or role).

Keep `sourceRefs` non-empty for `review_needed` cards too: it forces the author to declare where the fact came from before the card ever reaches runtime.
