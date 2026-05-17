<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Active plan

The current product workstream is the **Direct.Pro knowledge map**, Task 10 — filling knowledge cards by domain batch. Runtime already includes these `review_needed` packs:

- `campaign-types-v1` → `src/knowledge/direct-pro/cards/campaign-types.{json,ts}` (8 cards)
- `campaign-hierarchy-lifecycle-v1` → `src/knowledge/direct-pro/cards/campaign-hierarchy.{json,ts}` (13 cards)
- `campaign-group-settings-v1` → `src/knowledge/direct-pro/cards/campaign-group-settings.{json,ts}` (16 cards)
- off-order `interface-surfaces-v1` → `src/knowledge/direct-pro/cards/interface-surfaces.{json,ts}` (16 cards)
- off-order `ad-formats-elements-v1` → `src/knowledge/direct-pro/cards/ad-formats-elements.{json,ts}` (25 cards)
- off-order `formats-shows-v1` → `src/knowledge/direct-pro/cards/formats-shows.{json,ts}` (17 cards)
- `targeting-semantics-v1` → `src/knowledge/direct-pro/cards/targeting-semantics.{json,ts}` (18 cards)
- `billing-agency-legal-entities-v1` → `src/knowledge/direct-pro/cards/billing-agency-legal-entities.{json,ts}` (28 cards)
- `reports-statistics-optimization-v1` → `src/knowledge/direct-pro/cards/statistics.{json,ts}` (25 cards)
- off-order `account-access-settings-v1` → `src/knowledge/direct-pro/cards/account-access-settings.{json,ts}` (16 cards)
- `bulk-professional-surfaces-v1` → `src/knowledge/direct-pro/cards/bulk-professional-surfaces.{json,ts}` (18 cards)

The `ad-formats-elements-v1` pack was created from `baza_znaniy/banners/` because the user explicitly dropped a focused source folder. It covers ad formats, creative assets, and ad elements; moderation workflows remain out of scope for that pack. The `formats-shows-v1` pack was created from `baza_znaniy/formats and shows/` and covers ad formats, show/serving variants, placements, and showing diagnostics. The `targeting-semantics-v1` pack was created from `baza_znaniy/show-rules/` and covers targeting/show-rule semantics: autotargeting, keywords, negative phrases, semantic matching, interests, audience segments, restricted-topic show rules, and phrase CTR preservation. The `billing-agency-legal-entities-v1` pack was created from `baza_znaniy/money/` and covers money operations: invoice/payment, crediting, refunds, transfers, shared account, overdraft, payer constraints, promo codes, VAT, electronic receipts, non-resident payment limits, and payment failures. The `reports-statistics-optimization-v1` pack was created from `baza_znaniy/stats/` and covers reporting/statistics behavior: Report Wizard, Direct-vs-Metrica discrepancies, Metrica goals, traffic forecast limits, spikes/drops, invalid clicks/conversions, statistics corrections, optimization flows, strategy learning, and A/B experiments. The `account-access-settings-v1` pack was created from `baza_znaniy/acc-settings/` and covers account access, representatives, agency interface, agency login issuance, transfer to agency, blocked access, and PIN-code support identification. The `bulk-professional-surfaces-v1` pack was created from `baza_znaniy/tools/` and covers Direct / Direct.Pro tools and professional surfaces: API, XLS/XLSX, Commander, mobile app, campaign change history, feeds, Yandex Audiences, Wordstat, Budget Forecast, offline conversions, Conversion Center, Overview/Audit, Landing Builder, captcha, AI assistant, and AI creative editor. Future Task 10 work should continue one focused source pack at a time with human review before runtime promotion.

> **Architecture note (May 2026):** The standalone Product Challenger LLM stage is **OFF by default**. Approved Direct.Pro knowledge cards are now folded into the three group-evaluator prompts (`buildGroupPrompt`), so per-criterion `questions` are themselves Direct.Pro-aware. The legacy Challenger code path still exists and runs only when `PRODUCT_CHALLENGER_ENABLED=true` is set in the environment — kept for A/B comparisons and easy rollback. Task 10 work continues unchanged: the same approved cards now feed group evaluators instead of (or in addition to) the legacy Challenger.

Before touching `src/knowledge/direct-pro/`, `src/app/api/evaluate/route.ts`, the group-evaluator prompt, the Challenger prompt, or any source intake / source pack docs / extractor tooling, read:

- `docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md` — the plan. Start with "Implementation Status" and "How to resume Task 10 in a fresh session" to determine whether a pack is already drafted, already promoted, or the next pack should be started.
- `docs/knowledge/source-packs/README.md` — source pack manifest format and the fixed 10-batch order.
- `docs/knowledge/card-review-process.md` — card lifecycle (`draft → review_needed → approved → deprecated`) and the promotion criteria.
- `tools/direct-pro-knowledge/README.md` — hard rule about what may be committed (sanitized cards, manifests, extractor scripts) and what stays gitignored (`knowledge/raw-*`, `knowledge/drafts/`, `work/direct-pro-knowledge/`, `baza_znaniy/`, `.venv-pdf/`). Contains the end-to-end runbook for the manual PDF drop adapter and the validator.

### Canonical Task 10 flow for `baza_znaniy` drops

When the user points at `@baza_znaniy/<folder>` and says to add the new Direct/Direct.Pro knowledge to the agent context, treat it as the standard Task 10 source-pack workflow. Do not restart a brainstorming/design-approval loop, and do not ask the user again whether to do `draft_only`, `extract_only`, `promote_review_needed`, or whether the folder should count as one pack. The default is fixed:

1. Use the referenced folder as one focused source pack. If it contains mixed topics, choose the best pack id/domain, keep the pack narrow in `notes.md`, and record out-of-scope material in `coverage-note.md` or `unresolved-questions.md`.
2. Create or update `docs/knowledge/source-packs/<pack-id>/source-pack.yaml` and `notes.md`.
3. Create symlink inputs under `knowledge/drafts/<pack-id>/inputs/` that point to the PDFs in `baza_znaniy/<folder>/`; never commit the raw PDFs or extracted text.
4. Run `tools/direct-pro-knowledge/extract_pdf_text.py <pack-id>`.
5. Author the gitignored draft outputs: `candidate-cards.json`, `coverage-note.md`, `conflicts.md`, and `unresolved-questions.md`.
6. Run `npx tsx tools/direct-pro-knowledge/validate-candidates.ts <pack-id>` and fix validation issues.
7. If the user's request says "add to context" / "agent should know this" / "учитывать при оценке", promote safe cards into `src/knowledge/direct-pro/cards/<domain>.json` plus `<domain>.ts`, export them from `cards/index.ts`, and keep `confidence: "review_needed"` unless explicit product-owner approval says `approved`.
8. Run `npx vitest run`; run `npm run build` when runtime TypeScript or prompt wiring changed.

Ask the user only for a real blocker: the referenced folder is missing or unreadable, the intended source pack/domain cannot be inferred after reading filenames and existing pack docs, sources appear unsafe to summarize, promotion would duplicate or contradict existing runtime cards, or the user explicitly asks for a review gate before runtime promotion. Otherwise proceed with the canonical flow and report the chosen pack id/domain in the progress update.

For broader context (Pre-Analysis round, scoring calibration history, key files), read `CONTEXT.md`.

## Local research / test artifacts

Root-level untracked files such as `epic*.md`, `epic-review-*.md`, `challenger-vs-evaluator.xlsx`, and one-off files under `docs/superpowers/specs/` are local research, benchmark, or test inputs used by the user when running epics through agents. Do **not** add or commit these files unless the user explicitly names them and asks to commit them. When committing project work, stage only the relevant source/docs paths and leave these artifacts untracked.

## Knowledge extraction tooling

For Task 10 batches, two committed scripts handle the manual PDF drop workflow:

- `tools/direct-pro-knowledge/extract_pdf_text.py` — PyMuPDF-based extractor; reads `knowledge/drafts/<pack-id>/inputs/` (often symlinks into `baza_znaniy/`), writes `.txt` into `knowledge/drafts/<pack-id>/extracted/`. Requires the local `.venv-pdf` (`python3 -m venv .venv-pdf && .venv-pdf/bin/pip install --quiet pymupdf`).
- `tools/direct-pro-knowledge/validate-candidates.ts` — Zod-validator for `candidate-cards.json`. Run `npx tsx tools/direct-pro-knowledge/validate-candidates.ts <pack-id>` before asking the user for review and again before promotion.

Both `baza_znaniy/` and `.venv-pdf/` are gitignored. The PDFs themselves should never enter git.

## Model + tests

- All LLM calls (Pre-Analysis, three group evaluators, and the legacy Product Challenger when enabled) share the constant `EVALUATION_MODEL` in `src/lib/openai.ts`. Change the model there, not inline.
- The flag `isProductChallengerEnabled()` (also in `src/lib/openai.ts`) reads `PRODUCT_CHALLENGER_ENABLED`. Default is `false` — Direct.Pro context lives inside the group evaluators, the standalone Challenger is skipped.
- Tests run with `npx vitest run` (or `npm test`). `npm run build` runs typecheck + Next.js production build. Keep both green before commits that touch runtime code.
