<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Active plan

The current product workstream is the **Direct.Pro Product Challenger knowledge map**, Task 10 — filling knowledge cards by domain batch. **Right now the pack `campaign-types-v1` is drafted in `knowledge/drafts/campaign-types-v1/` (gitignored) and waiting for human review before promotion into `src/knowledge/direct-pro/cards/campaign-types.ts`.** Do not start a new pack until that one lands.

Before touching `src/knowledge/direct-pro/`, `src/app/api/evaluate/route.ts`, the Challenger prompt, or any source intake / source pack docs / extractor tooling, read:

- `docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md` — the plan. Start with "Implementation Status" (incl. "Pack `campaign-types-v1` — current state") and "How to resume Task 10 in a fresh session" — that section has two distinct paths (A: pack already drafted, awaiting promotion; B: starting a fresh pack). Pick the right one.
- `docs/knowledge/source-packs/README.md` — source pack manifest format and the fixed 10-batch order.
- `docs/knowledge/card-review-process.md` — card lifecycle (`draft → review_needed → approved → deprecated`) and the promotion criteria.
- `tools/direct-pro-knowledge/README.md` — hard rule about what may be committed (sanitized cards, manifests, extractor scripts) and what stays gitignored (`knowledge/raw-*`, `knowledge/drafts/`, `work/direct-pro-knowledge/`, `baza_znaniy/`, `.venv-pdf/`). Contains the end-to-end runbook for the manual PDF drop adapter and the validator.

For broader context (Pre-Analysis round, scoring calibration history, key files), read `CONTEXT.md`.

## Knowledge extraction tooling

For Task 10 batches, two committed scripts handle the manual PDF drop workflow:

- `tools/direct-pro-knowledge/extract_pdf_text.py` — PyMuPDF-based extractor; reads `knowledge/drafts/<pack-id>/inputs/` (often symlinks into `baza_znaniy/`), writes `.txt` into `knowledge/drafts/<pack-id>/extracted/`. Requires the local `.venv-pdf` (`python3 -m venv .venv-pdf && .venv-pdf/bin/pip install --quiet pymupdf`).
- `tools/direct-pro-knowledge/validate-candidates.ts` — Zod-validator for `candidate-cards.json`. Run `npx tsx tools/direct-pro-knowledge/validate-candidates.ts <pack-id>` before asking the user for review and again before promotion.

Both `baza_znaniy/` and `.venv-pdf/` are gitignored. The PDFs themselves should never enter git.

## Model + tests

- All four LLM calls (Pre-Analysis, three group evaluators, Product Challenger) share the constant `EVALUATION_MODEL` in `src/lib/openai.ts`. Change the model there, not inline.
- Tests run with `npx vitest run` (or `npm test`). `npm run build` runs typecheck + Next.js production build. Keep both green before commits that touch runtime code.
