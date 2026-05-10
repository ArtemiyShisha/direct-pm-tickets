# Direct.Pro Knowledge Tooling

Locally-run extractors that turn raw source material into **draft** Direct.Pro knowledge cards. These tools are deliberately separated from the Railway runtime: the runtime never sees Arcadia paths, Wiki dumps, or unreviewed extracts.

## What lives here

| File | Purpose |
|---|---|
| `extract_pdf_text.py` | PyMuPDF-based PDF → text extractor for a single source pack. Reads from `knowledge/drafts/<pack-id>/inputs/` (gitignored, may contain symlinks), writes UTF-8 `.txt` per PDF into `knowledge/drafts/<pack-id>/extracted/` (also gitignored). Adds `# Source:` / `# Pages:` headers and `----- page N -----` markers. |
| `validate-candidates.ts` | Standalone Zod-validator for a draft pack. Parses `knowledge/drafts/<pack-id>/candidate-cards.json` against `directProKnowledgeCardSchema`, checks id uniqueness (within draft and against already-shipped runtime cards), forbids `confidence: "approved"` in drafts, and verifies non-empty `aliases` and `sourceRefs`. Run before asking for human review. |

`baza_znaniy/` (gitignored) is the conventional drop folder for user-provided PDFs. The pack manifest references gitignored symlinks under `knowledge/drafts/<pack-id>/inputs/` so the canonical input path stays consistent with the docs even when the PDFs themselves never enter git.

## Source Rules

> **Hard rule.** Raw Arcadia/Wiki dumps are local-only. Do not commit files from any of:
>
> - `knowledge/arcadia/`
> - `knowledge/wiki-dumps/`
> - `knowledge/raw-arcadia/`
> - `knowledge/raw-wiki/`
> - `knowledge/drafts/`
> - `work/direct-pro-knowledge/`
> - `baza_znaniy/`
> - `.venv-pdf/`
>
> All of the above are listed in `.gitignore` (see `git check-ignore -v <path>` to confirm). User-provided PDFs/texts may be committed as source material **only when explicitly approved by the user** and dropped into a tracked path under `docs/knowledge/source-packs/<pack-id>/inputs/`. Large PDFs (>5 MB) should stay gitignored under `baza_znaniy/` or `knowledge/drafts/<pack-id>/inputs/` and be referenced via symlinks.
>
> Railway must use only approved sanitized cards from `src/knowledge/direct-pro/cards/`. Anything else is out of scope.

Additional constraints (from the plan):

- Do not use `grep`, `rg`, or `find` from the Arcadia root. Use `ya tool cs` only to locate references, never to crawl files.
- Runtime prompts must receive only a small relevant subset of approved cards (selected by `selectDirectProCards`), not full document dumps.
- Every fact must be reviewable and correctable by a human before it becomes runtime knowledge.

## When To Add A Source Adapter

The **manual PDF drop** adapter is implemented (`extract_pdf_text.py`). For other sources — do not write a Wiki crawler or Arcadia adapter speculatively. Write one only when:

1. The source for the next batch is settled (e.g. a `WIKI_TOKEN` is available and the target Wiki cluster is approved).
2. The next batch's `source pack` manifest exists in `docs/knowledge/source-packs/<pack-id>/source-pack.yaml` and lists the inputs.
3. There is at least one human reviewer assigned for that batch.

Candidate adapters, in increasing complexity:

- **Manual PDF/text drop** ✅ implemented as `extract_pdf_text.py`. Inputs land under `docs/knowledge/source-packs/<pack-id>/inputs/` (committed) or `knowledge/drafts/<pack-id>/inputs/` (gitignored, may be symlinks into `baza_znaniy/`). The extractor reads only the files in `inputs/`.
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

The end-to-end flow for a single source pack:

1. **Manifest.** Create or update `docs/knowledge/source-packs/<pack-id>/source-pack.yaml` (and optionally `notes.md`).
2. **Inputs.** Drop the source files (PDFs, text, etc.) into the manifest's `input_files` location. For large PDFs, keep them under the gitignored `baza_znaniy/` and create symlinks into `knowledge/drafts/<pack-id>/inputs/`:
   ```bash
   mkdir -p knowledge/drafts/<pack-id>/inputs
   cd knowledge/drafts/<pack-id>/inputs
   for f in ../../../../baza_znaniy/<subfolder>/*.pdf; do ln -sf "$f" "$(basename "$f")"; done
   ```
3. **Extract.** Set up the local PyMuPDF venv once and run the PDF extractor:
   ```bash
   python3 -m venv .venv-pdf && .venv-pdf/bin/pip install --quiet pymupdf
   .venv-pdf/bin/python tools/direct-pro-knowledge/extract_pdf_text.py <pack-id>
   ```
   Text lands in `knowledge/drafts/<pack-id>/extracted/<basename>.txt` (gitignored).
4. **Author drafts.** Read the extracted text, write `candidate-cards.json` (and the three accompanying `.md` files) into `knowledge/drafts/<pack-id>/`. Cards must be `confidence: "review_needed"` and the json must be a flat array.
5. **Validate.** Run the schema/uniqueness checker:
   ```bash
   npx tsx tools/direct-pro-knowledge/validate-candidates.ts <pack-id>
   ```
   Fix anything it complains about — do not ship a pack that fails validation.
6. **Stop for human review.** The user reads `candidate-cards.json` together with `notes.md`, `unresolved-questions.md`, `conflicts.md`, `coverage-note.md` and either edits cards inline or rejects them. See `docs/knowledge/card-review-process.md` for promotion criteria.
7. **Promote.** After approval, copy the approved cards into a typed file `src/knowledge/direct-pro/cards/<domain>.ts`, export them via `src/knowledge/direct-pro/cards/index.ts`, then re-run:
   ```bash
   npx vitest run
   npm run build
   ```
   Both must stay green before starting the next pack.
