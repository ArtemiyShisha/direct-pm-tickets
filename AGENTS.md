<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Active plan

The current product workstream is the **Direct.Pro Product Challenger knowledge map**. Before touching `src/knowledge/direct-pro/`, `src/app/api/evaluate/route.ts`, the Challenger prompt or any source intake / source pack docs, read:

- `docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md` — the plan. Start with the "Implementation Status" table and "How to resume Task 10 in a fresh session" right after the goal/architecture section. Tasks 1-9 and 11 are merged; Task 10 (filling cards by domain batch) is iterative — one source pack at a time with human review between batches.
- `docs/knowledge/source-packs/README.md` — source pack manifest format and the fixed 10-batch order.
- `docs/knowledge/card-review-process.md` — card lifecycle (`draft → review_needed → approved → deprecated`) and the promotion criteria.
- `tools/direct-pro-knowledge/README.md` — hard rule about what may be committed and what stays gitignored under `knowledge/raw-*`, `knowledge/drafts/`, `work/direct-pro-knowledge/`.

For broader context (Pre-Analysis round, scoring calibration history, key files), read `CONTEXT.md`.

## Model + tests

- All four LLM calls (Pre-Analysis, three group evaluators, Product Challenger) share the constant `EVALUATION_MODEL` in `src/lib/openai.ts`. Change the model there, not inline.
- Tests run with `npx vitest run` (or `npm test`). `npm run build` runs typecheck + Next.js production build. Keep both green before commits that touch runtime code.
