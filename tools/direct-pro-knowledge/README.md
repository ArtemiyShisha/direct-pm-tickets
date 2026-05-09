# Direct.Pro Knowledge Tooling

Locally-run extractors that turn raw source material into **draft** Direct.Pro knowledge cards. These tools are deliberately separated from the Railway runtime: the runtime never sees Arcadia paths, Wiki dumps, or unreviewed extracts.

## Source Rules

> **Hard rule.** Raw Arcadia/Wiki dumps are local-only. Do not commit files from any of:
>
> - `knowledge/arcadia/`
> - `knowledge/wiki-dumps/`
> - `knowledge/raw-arcadia/`
> - `knowledge/raw-wiki/`
> - `knowledge/drafts/`
> - `work/direct-pro-knowledge/`
>
> All of the above are listed in `.gitignore` (see `git check-ignore -v <path>` to confirm). User-provided PDFs/texts may be committed as source material **only when explicitly approved by the user** and dropped into a tracked path under `docs/knowledge/source-packs/<pack-id>/`.
>
> Railway must use only approved sanitized cards from `src/knowledge/direct-pro/cards/`. Anything else is out of scope.

Additional constraints (from the plan):

- Do not use `grep`, `rg`, or `find` from the Arcadia root. Use `ya tool cs` only to locate references, never to crawl files.
- Runtime prompts must receive only a small relevant subset of approved cards (selected by `selectDirectProCards`), not full document dumps.
- Every fact must be reviewable and correctable by a human before it becomes runtime knowledge.

## When To Add A Source Adapter

Source adapters are intentionally not implemented yet. **Do not write a Wiki crawler or Arcadia adapter speculatively.** Write one only when:

1. The source for the next batch is settled (e.g. user provides a PDF, or a `WIKI_TOKEN` is available and the target Wiki cluster is approved).
2. The next batch's `source pack` manifest exists in `docs/knowledge/source-packs/<pack-id>/source-pack.yaml` and lists the inputs.
3. There is at least one human reviewer assigned for that batch.

Candidate adapters, in increasing complexity:

- **Manual PDF/text drop.** Easiest. User uploads a sanitized PDF/text into `docs/knowledge/source-packs/<pack-id>/inputs/` (committed) or into `knowledge/drafts/<pack-id>/inputs/` (gitignored). The extractor reads only the files listed in the manifest.
- **Wiki API.** Requires `WIKI_TOKEN`. Output goes to `knowledge/raw-wiki/` (gitignored). Approved excerpts are summarized into card drafts; raw markdown is never committed.
- **`ya tool cs` lookups.** Only for locating Wiki/Arcadia references when checking source cross-links. Output stays in `knowledge/raw-arcadia/` (gitignored).

## Extractor Output Contract

For each source pack, an extractor must produce, under an ignored path (e.g. `knowledge/drafts/<pack-id>/`):

- `candidate-cards.json` — array of objects shaped like `DirectProKnowledgeCard` (`src/knowledge/direct-pro/schema.ts`), with `confidence: "review_needed"`.
- `unresolved-questions.md` — facts the source did not settle.
- `conflicts.md` — places where two sources disagree.
- `coverage-note.md` — which parts of the skeleton were covered and which were skipped.

Only the candidate cards (after human review) are then promoted into a typed file in `src/knowledge/direct-pro/cards/<domain>.ts`. The drafts and raw inputs stay local.

## Workflow Summary

1. Define or update `docs/knowledge/source-packs/<pack-id>/source-pack.yaml`.
2. Place inputs in the manifest's `input_files` location (committed or gitignored, per the rules above).
3. Run the extractor (or do it manually for the first batch).
4. Review candidate cards using `docs/knowledge/card-review-process.md`.
5. Promote `approved` cards into `src/knowledge/direct-pro/cards/<domain>.ts` and add aliases that the selector can match against real epic text.
6. Re-run `npx vitest run` and `npm run build`.
