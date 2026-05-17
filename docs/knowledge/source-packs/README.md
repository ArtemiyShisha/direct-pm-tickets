# Direct.Pro Source Packs

Source packs are small, reviewable input groups for knowledge extraction. **Do not extract cards from the entire source corpus at once** — that exceeds context, mixes unrelated domains, and produces cards too generic to challenge real epics.

Each batch of cards must come from exactly one source pack.

## Manifest Shape

Each pack lives in `docs/knowledge/source-packs/<pack-id>/source-pack.yaml` and must define:

```yaml
id: campaign-types-v1
domain: campaign_types
input_files:
  # Either tracked, user-approved files under this folder:
  - docs/knowledge/source-packs/campaign-types-v1/inputs/campaign-types.pdf
  # Or gitignored local-only files (never committed):
  # - knowledge/drafts/campaign-types-v1/inputs/wiki-export.md
expected_card_kinds:
  - campaign_type
out_of_scope:
  - detailed settings (covered by campaign-group-settings-v1)
  - moderation flow (covered by a future moderation-focused pack)
review_owner: <product owner / domain expert handle>
forbidden_inputs:
  - raw Arcadia paths
  - unreviewed Wiki dumps committed to repo
output_path: knowledge/drafts/campaign-types-v1/
```

The `output_path` always points to a gitignored directory under `knowledge/drafts/` so candidate cards never leak into git before review.

## Batch Order

Run packs in this order. Each pack must finish review before the next one starts.

1. `campaign-types-v1` — EPK, Master of Campaigns, Simple Start, mobile app promotion, Telegram, product, reach, archived types.
2. `campaign-hierarchy-lifecycle-v1` — account, campaign, ad group, ad, statuses, start/stop/archive/delete/copy, old vs new campaigns.
3. `campaign-group-settings-v1` — autotargeting, geo, time targeting, bid adjustments, goals, Metrica, URLs, recommendations, notifications.
4. `bulk-professional-surfaces-v1` — grids, mass edit, copy, Excel, Commander, API, mobile app, change history.
5. `targeting-semantics-v1` — keywords, negative phrases, audience segments, retargeting, interests, display conditions, semantic matching.
6. `moderation-ad-materials-v1` — moderation statuses, remoderation, rejection reasons, and review workflows. Ad formats/materials/elements are now covered by off-order `ad-formats-elements-v1`, so do not duplicate them here.
7. `billing-agency-legal-entities-v1` — payers, shared account, VAT, non-residents, agency/subclient relations, legal entity and country constraints.
8. `reports-statistics-optimization-v1` — reports, statistics discrepancies, Metrica goals, invalid clicks, optimization flows, post-launch analytics.
9. `legal-marking-compliance-v1` — ad marking, ERIR, ORD, tokens, documents, sanctions, personal data, legal restrictions.
10. `support-adjacent-services-v1` — support processes, Yandex Business, advertising subscription, partner office, other Yandex services.

Off-order packs may exist only when the user explicitly drops a focused source folder and asks to process it. Existing off-order packs:

- `interface-surfaces-v1` — client-facing Direct / Direct.Pro surfaces from `baza_znaniy/interface/`.
- `ad-formats-elements-v1` — ad formats, ad materials, and ad elements from `baza_znaniy/banners/`; moderation workflows remain out of scope.

## Per-Batch Output Contract

Every batch must end with:

- approved or `review_needed` cards for **only that batch's domain**;
- `unresolved_questions` for facts that sources did not settle;
- `conflicts` when two sources disagree;
- `coverage_note` saying which parts of the skeleton were covered and which were skipped;
- **no raw source quotes** unless the source file is explicitly approved for commit.

## Context Management Rules

Re-stating the planning constraints, because they are easy to violate when working in batches:

- Load only the files for the current source pack into the extractor turn.
- Keep raw source excerpts local to the extraction turn — never commit them.
- Prefer more, smaller cards over a single broad card.
- Do not merge cards across domains until both domains are reviewed.
- If a card needs facts from another domain, reference a future card id and add an unresolved question instead of guessing.
- Stop after each batch for human review before starting the next one.

## Folder Layout

```
docs/knowledge/source-packs/
  README.md                         # this file
  <pack-id>/
    source-pack.yaml                # manifest, committed
    inputs/                         # user-approved sources (PDF/text), committed
    notes.md                        # optional, committed
knowledge/drafts/<pack-id>/         # gitignored extractor outputs
  inputs/                           # gitignored (or symlinks into baza_znaniy/)
  extracted/                        # gitignored (output of extract_pdf_text.py)
  candidate-cards.json
  unresolved-questions.md
  conflicts.md
  coverage-note.md
```

The reviewer reads `notes.md` + `candidate-cards.json` together with the inputs and decides which cards graduate to `src/knowledge/direct-pro/cards/<domain>.ts`.

## Tooling

The end-to-end runbook for a single pack lives in `tools/direct-pro-knowledge/README.md`. The two scripts you will use:

- `.venv-pdf/bin/python tools/direct-pro-knowledge/extract_pdf_text.py <pack-id>` — turn PDFs in `knowledge/drafts/<pack-id>/inputs/` into `.txt` files in `knowledge/drafts/<pack-id>/extracted/` (both gitignored).
- `npx tsx tools/direct-pro-knowledge/validate-candidates.ts <pack-id>` — validate `candidate-cards.json` against the runtime Zod schema and check id collisions before asking for human review.

Promotion (after the user approves a draft pack) and the resume rules for fresh sessions are documented in `docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md` under "How to resume Task 10".
