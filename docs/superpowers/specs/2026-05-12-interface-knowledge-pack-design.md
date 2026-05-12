# Direct.Pro Interface Knowledge Pack — Design

> Brainstorm output for adding interface-domain knowledge to the Direct.Pro Product Challenger context. Approved by the user on 2026-05-12. The implementation plan derived from this design lives in `docs/superpowers/plans/` (see writing-plans output).

## Context

The current product workstream is the **Direct.Pro Product Challenger knowledge map**, Task 10. Two source packs are currently in `knowledge/drafts/` (gitignored), validated but **not yet promoted** into the runtime cards directory:

- `campaign-types-v1` — manifest committed (`24a3c22`), draft awaits promotion;
- `campaign-group-settings-v1` — manifest committed (`c05f5c2`), draft awaits promotion.

`src/knowledge/direct-pro/cards/` currently exports only `core.ts` (3 entity cards). This means runtime Challenger does not yet see campaign-types or settings facts. Selector `selectDirectProCards` and the Challenger prompt do not need to change for new cards to work.

The user added a new gitignored input folder `baza_znaniy/interface/` with 9 PDFs covering Direct.Pro UI surfaces, lifecycle actions, registration, recommendations and the vendor office. The user wants all interface knowledge to land in runtime in this session.

## Goal

Get all interface-domain knowledge from `baza_znaniy/interface/` into the **draft state** (`candidate-cards.json` per pack, validated) inside this session, after first promoting the two existing drafts so runtime is consistent. Promotion of the two new packs follows the same human-review gate and is explicitly out of scope for this session.

## Out of Scope

- Runtime prompt or Challenger schema changes — the existing pipeline accepts any approved card array, no edits needed.
- Selector tuning (`selectDirectProCards`) — alias coverage broadens automatically as new cards land.
- Wiki API or Arcadia adapters — not needed; manual PDF drop is the agreed source for this batch.
- Cards from PDFs that are not in `baza_znaniy/interface/` (campaign types and settings PDFs are already drafted in their own packs).

## Pack Breakdown

Two new packs are introduced. The third PDF group (vendor office) is folded into pack 2 because the user explicitly wanted all 9 interface PDFs covered in this session and creating a 1-PDF pack for vendor office is wasteful.

### Pack A: `campaign-hierarchy-lifecycle-v1` (planned batch 2 in `docs/knowledge/source-packs/README.md`)

Inputs (3 PDFs, gitignored, symlinked):

- `Действия с кампаниями.pdf`
- `Действия с группами объявлений.pdf`
- `Действия с объявлениями.pdf`

Domain: account/campaign/ad_group/ad lifecycle and actions. Expected card kinds: `entity`, `state`, `action`. Expected card ids (will be refined during extraction):

```
entity.account
entity.campaign        (deepens the existing core card)
entity.ad_group        (deepens the existing core card)
entity.ad              (deepens the existing core card)
state.campaign_status
state.ad_status
action.campaign_start_stop
action.campaign_archive
action.campaign_delete
action.campaign_copy
action.campaign_send_to_moderation
action.group_*         (counterparts for group-level actions)
action.ad_*            (counterparts for ad-level actions)
```

Out-of-scope for this pack: detailed campaign settings (covered by `campaign-group-settings-v1`), bulk surfaces (covered by `bulk-professional-surfaces-v1` later), moderation flow detail (covered by `moderation-ad-materials-v1` later).

The existing `core.ts` cards `entity.campaign / entity.ad_group / entity.ad` will be **superseded** during promotion of this pack: their detailed versions move to `src/knowledge/direct-pro/cards/campaign-hierarchy.ts` and the `core.ts` placeholders are removed to keep `id` uniqueness. This is explicit in the implementation plan, not a side-effect.

### Pack B: `interface-surfaces-v1` (off-plan; bookkeeping note added to README)

Inputs (6 PDFs, gitignored, symlinked):

- `Интерфейс Директа для клиента.pdf`
- `Интерфейсы Директ и Директ Про.pdf`
- `Инструменты и ошибки в интерфейсе.pdf`
- `Регистрация в Директе.pdf`
- `Рекомендации.pdf`
- `Директ Про для вендоров.pdf`

Domain: user-facing surfaces of the Direct/Direct.Pro family, plus onboarding and the vendor office. Expected card kinds: `surface`, `concept`, `process`, `failure`, `tool`. Expected card ids (refined during extraction):

```
surface.client_interface
surface.direct_pro_interface
surface.recommendations          # distinct from setting.auto_apply_recommendations
surface.vendor_office            # Direct.Pro для вендоров
concept.direct_vs_direct_pro_split
process.registration             # or action.account_registration
failure.*                        # typical UI failures named by the PDF
tool.*                           # UI tooling: search, filters, bulk select, navigation
```

Notes:

- `surface.recommendations` and `setting.auto_apply_recommendations` (already drafted in `campaign-group-settings-v1`) are **separate cards**: one is the UI surface where recommendations live, the other is the auto-apply setting. They cross-reference each other in `relatedCards`.
- `surface.vendor_office` is **not** the same as `setting.vendor_copromotion` (also drafted in settings). The setting describes joint-promotion configured inside an ordinary campaign; the surface describes the standalone vendor cabinet UI.
- Pack B is **not** in the documented 10-batch order. Its `notes.md` will say so explicitly and will state that the original 10-batch order remains valid for future packs (`bulk-professional-surfaces-v1`, `targeting-semantics-v1`, etc.).

Out-of-scope for this pack: bulk operation surfaces — sets, mass edit, copy, Excel, Commander, API, change history (those belong to the future `bulk-professional-surfaces-v1`).

## Phases

### Phase 1 — Promote `campaign-types-v1` into runtime

1. Read `coverage-note.md`, `conflicts.md`, `unresolved-questions.md`, `candidate-cards.json` from `knowledge/drafts/campaign-types-v1/`.
2. Walk the user through every card; collect inline edits / drops / approvals.
3. Apply edits to `candidate-cards.json`, then `npx tsx tools/direct-pro-knowledge/validate-candidates.ts campaign-types-v1` until clean.
4. Create `src/knowledge/direct-pro/cards/campaign-types.ts` exporting `CAMPAIGN_TYPE_DIRECT_PRO_CARDS: DirectProKnowledgeCard[]`.
5. Wire it into `src/knowledge/direct-pro/cards/index.ts` (spread alongside `CORE_DIRECT_PRO_CARDS`).
6. `npx vitest run` (id-uniqueness test stays green) and `npm run build`.
7. Commit `feat(knowledge): promote campaign-types-v1 cards`.

Confidence stays `review_needed` unless the user explicitly approves a card to `approved` per `docs/knowledge/card-review-process.md`.

### Phase 2 — Promote `campaign-group-settings-v1` into runtime

Identical shape to Phase 1, target file `src/knowledge/direct-pro/cards/campaign-group-settings.ts`, commit `feat(knowledge): promote campaign-group-settings-v1 cards`. (Source pack manifest is already committed in `c05f5c2`, so no extra bookkeeping commit is needed.)

### Phase 3 — Author `campaign-hierarchy-lifecycle-v1` draft

1. Create `docs/knowledge/source-packs/campaign-hierarchy-lifecycle-v1/source-pack.yaml` (committed) and `notes.md` (committed). The manifest references gitignored symlinks under `knowledge/drafts/<pack-id>/inputs/`.
2. `mkdir -p knowledge/drafts/campaign-hierarchy-lifecycle-v1/inputs/` and create symlinks from there to the three `Действия с *.pdf` files in `baza_znaniy/interface/`.
3. `.venv-pdf/bin/python tools/direct-pro-knowledge/extract_pdf_text.py campaign-hierarchy-lifecycle-v1`.
4. Read extracted `.txt` files. Author `candidate-cards.json` plus `unresolved-questions.md`, `conflicts.md`, `coverage-note.md` in `knowledge/drafts/campaign-hierarchy-lifecycle-v1/`. All four files stay gitignored.
5. `npx tsx tools/direct-pro-knowledge/validate-candidates.ts campaign-hierarchy-lifecycle-v1` until clean.
6. Stop. Wait for human review. Promotion is a separate session.

### Phase 4 — Author `interface-surfaces-v1` draft

Same shape as Phase 3 with these specifics:

- Manifest's `notes.md` includes a header note: "Off-plan pack added on top of the original 10-batch order. The 10-batch order in `docs/knowledge/source-packs/README.md` still applies for future packs (next planned: `bulk-professional-surfaces-v1`)".
- Symlinks point to all 6 interface PDFs listed in Pack B.
- The `out_of_scope` list explicitly defers bulk surfaces, mass edit, Excel, Commander, API, change history to `bulk-professional-surfaces-v1`.
- After validation, stop and wait for review.

### Phase 5 — Bookkeeping

After Phases 1-4 are committed:

- Update `docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md` "Implementation Status": mark `campaign-types-v1` and `campaign-group-settings-v1` as promoted (with their commits), and add new "Pack `campaign-hierarchy-lifecycle-v1` — current state" / "Pack `interface-surfaces-v1` — current state" sections describing the drafted state.
- Update the "Active plan" block in `AGENTS.md` to reflect the current state (no longer "campaign-types-v1 awaits promotion"; new state is "two new packs drafted, awaiting review").
- Update `docs/knowledge/source-packs/README.md`'s "Batch Order" section: append a note saying `interface-surfaces-v1` was added off-plan after batch 3.

## Verification

- After Phase 1: `npx vitest run` and `npm run build` both green; new file `src/knowledge/direct-pro/cards/campaign-types.ts` referenced from `cards/index.ts`; commit on the branch.
- After Phase 2: same checks; new file `src/knowledge/direct-pro/cards/campaign-group-settings.ts` referenced from `cards/index.ts`.
- After Phase 3: `npx tsx tools/direct-pro-knowledge/validate-candidates.ts campaign-hierarchy-lifecycle-v1` exits 0; new manifest and notes are committed; drafts and inputs remain gitignored.
- After Phase 4: same checks for `interface-surfaces-v1`.
- After Phase 5: `git status` clean; `AGENTS.md` and the master plan are consistent with the actual state on disk.

## Risks and Mitigations

- **Id collision when promoting `campaign-hierarchy-lifecycle-v1`** — current `core.ts` already defines `entity.campaign / ad_group / ad`. Mitigation: when this pack is promoted (separate session, out of scope here), remove the placeholders from `core.ts` and let the deeper cards in `campaign-hierarchy.ts` take over. The Phase 3 deliverable (the draft) just needs to flag this in `unresolved-questions.md` so the future promotion session does the right thing.
- **Off-plan pack `interface-surfaces-v1` pollutes 10-batch order** — mitigation: explicit bookkeeping in `README.md` and pack `notes.md` so future agents do not silently drop the original order.
- **Vendor office card may overlap with later `support-adjacent-services-v1` (batch 10)** — mitigation: log a forward-reference in `unresolved-questions.md` of `interface-surfaces-v1` saying the vendor office card may need re-homing into the future support-adjacent pack; do not duplicate it.
- **Setting "Рекомендации" already drafted as `setting.auto_apply_recommendations`** — mitigation: the new card `surface.recommendations` is intentionally a different facet (UI vs setting); both cards cross-link via `relatedCards`. Validation tool catches accidental id duplicates.

## Non-Goals

- Promoting the two new interface packs in this session. Each pack must finish review before promotion (rule from `docs/knowledge/source-packs/README.md`).
- Touching the Challenger prompt, Pre-Analysis, or `EVALUATION_MODEL`.
- Importing PDFs themselves into git. The PDFs stay under `baza_znaniy/` (gitignored).
