# UI Readability + «Директ Про» Terminology Rename — Design

> Brainstorm output for two combined improvements: making the evaluation result page more readable, and unifying brand naming. Approved by the user on 2026-05-12. Implementation plan derives from this design (see `docs/superpowers/plans/`).

## Context

Current evaluation result page (`src/components/evaluation-result.tsx`) has two reported readability problems:

1. **Hierarchy collapse inside cards.** Both criterion cards and product challenge cards use the same low-contrast subheading style (`text-xs font-medium text-black/60`) for every internal block (Анализ / Найдено / Не хватает / Вопросы к PM / Черновик; Что заметили / Контекст / Почему важно / Вопрос / Хороший ответ). With long LLM-generated text, everything visually merges into a single grey wall. There are no separators between blocks inside a card.
2. **Visual weight imbalance between sections.** Criterion cards are collapsed by default — user clicks to expand. Product challenge cards are always fully expanded and consume vertical space upfront. Result: challenges visually dominate while the score evaluation looks secondary.

Brand naming is currently mixed: `src/knowledge/direct-pro/cards/*.json` content uses `Direct` / `Direct.Pro` (latin, with dot). `src/knowledge/direct-context.ts` and a few prompts already use `Директ Про` (Russian, space). The user wants one canonical user-facing form.

## Goal

1. Bring the result page to a state where evaluation and challenges have equal visual weight (both sets of cards collapse), and where opening any card shows clearly demarcated sections.
2. Unify brand naming in all user-facing strings (UI, markdown export, prompts, knowledge card content) to **«Директ Про»** (Cyrillic, space, no dot) for the pro surface and **«Директ»** for the basic surface.

## Out of Scope

- Code identifiers: TypeScript symbols (`DirectProKnowledgeCard`, `selectDirectProCards`, `INTERFACE_SURFACES_DIRECT_PRO_CARDS`), file paths (`src/knowledge/direct-pro/`), card IDs (`direct-pro-*`), product IDs (`direct_pro`, `direct_lite`) stay as-is. They are stable internal contracts.
- Knowledge card `references[]` entries: `label` (e.g. `"internal Direct.Pro support page «Интерфейсы Директ и Директ Про»"`) and `location` (e.g. `"knowledge/drafts/.../Директ Про для вендоров-v1-5_12_202.pdf"`) are formal source identifiers and stay as-is.
- New components or routing changes. Both improvements live inside the existing result page and existing string sources.
- Changes to evaluation logic, scoring, or schemas.
- Markdown export visual style — only terminology updates inside it.

## Design

### Part 1 — Result page readability (UI)

#### 1.1 Collapsible challenge cards (approach **A**)

`ProductChallengeCard` becomes collapsible, mirroring `CriterionCard`:

- **Collapsed state (header row):** `[severity badge] [type badge] [target if present] — short preview`. The preview is `challenge.question ?? challenge.observation ?? ""`, single-line clamped (`line-clamp-1` or `line-clamp-2`). Keep the left border in severity colour. Click-target: the whole header.
- **Expanded state:** the existing full body (Что заметили → Контекст → Почему важно → Вопрос к PM → Хороший ответ → footer with related criteria + card refs), restyled per 1.2.
- Default: all challenges collapsed (same as criteria).

The "Развернуть все" / "Свернуть все" button at the top now controls **both** sections together. Implementation: extend `openSet: Set<string>` to use namespaced keys (`crit:<criterionId>` and `chal:<index>`), and `allIds` becomes `[...criteriaIds, ...challengeIds]`. `toggleAll`, `setOne`, and `allExpanded` derive from this single set. The button label remains based on `allExpanded` (true when set size equals total of both).

`ProductChallengesSection` keeps its top bar (icon + "Продуктовые челленджи" + count + "Не влияют на оценку" + intro paragraph). The sorting (high → medium → low) stays.

#### 1.2 Subheading hierarchy + separators inside cards (approach **1**)

Apply consistently to expanded `CriterionCard` and expanded `ProductChallengeCard` body sections.

- **Subheading style:** replace `text-xs font-medium text-black/60` with `text-sm font-semibold text-foreground`. Icon stays at its current size (`h-3 w-3`) but uses `text-muted-foreground` to keep the icon as a quiet anchor next to a now-bold heading.
- **Block separators:** wrap the body sections in `divide-y divide-border` and give each block `pt-3 first:pt-0` (or equivalent). Tested visual: a thin neutral line between e.g. "Анализ" and "Найдено в эпике".
- **Body text:** keep current `text-sm text-black leading-relaxed` for paragraphs. Lists keep their bullet + emerald/red dots.
- **`FoundMissingLists`:** the small "Найдено в эпике" / "Не хватает" labels also get bumped to `text-sm font-semibold` (matching siblings), but keep their semantic colour (`text-emerald-700`, `text-red-700`).
- **Inside `ProductChallengeCard` body:** the row of badges + target stays at the top. The body is the divided stack of subheaded blocks. The footer (related criteria badges + card refs) stays as-is, separated from the body by the existing `border-t pt-3`.

The `divide-y` approach scales well: blocks are conditionally rendered, and `divide-y` only paints lines between actual children, so a card with only "Что заметили + Вопрос к PM" gets one separator, not five.

#### 1.3 Markdown export

No layout changes. Only the terminology rename in Part 2 applies.

### Part 2 — «Директ Про» terminology rename

#### Canonical forms (user-facing)

- **«Директ Про»** — pro surface (Cyrillic, single space, no dot, no quotes by default).
- **«Директ»** — basic surface, when context is the consumer-facing surface name (the lite client cabinet without API / Commander / Excel etc.).
- The same word **«Директ»** also appears as a shorthand for the whole product (`Яндекс Директ`, `аналитик Яндекс Директа`). This is a contextual ambiguity that exists today in customer materials too; not a contradiction. No change to those phrasings.
- **`Direct Light` / `лёгкая версия` / `упрощённая версия`** — explicitly forbidden in customer communication (this rule exists today in card `concept_direct_vs_direct_pro`); after rename it must read «Директ Лайт» / «лёгкая версия» / «упрощённая версия» in the forbidden list.

#### Replacement scope

Two kinds of changes:

**a) Mechanical replacements** in user-facing string content, applied to:

- `src/components/evaluation-result.tsx` — 2 string literals (`Контекст Direct.Pro`, intro paragraph in `ProductChallengesSection`).
- `src/lib/export-markdown.ts` — 2 string literals (challenge section intro, `Контекст Direct.Pro:` field label).
- `src/prompts/product-challenger-prompt.ts` — 4 occurrences of `Direct.Pro` in the system prompt body.
- `src/prompts/pre-analysis-prompt.ts` — already uses `Директ Про`; no change.
- `src/knowledge/direct-pro/cards/*.json` — content fields: `summary`, `challengeRules[].trigger`, `challengeRules[].challenge`, `lookFor[].field`, `lookFor[].expected`, `expectedFix`, and any other free-text fields. **Skip** `references[].label` and `references[].location`.
- `src/knowledge/epic-template.ts` — already uses `Директ Про`; no change.
- `src/knowledge/direct-context.ts` — `description` strings are already on Russian; verify and adjust any stray `Direct` → `Директ`.

Replacement rules (in this order, applied only inside whitelisted fields):
1. `Direct.Pro` → `Директ Про`
2. `«Direct»` → `«Директ»` (if it appears with quotes)
3. Standalone token `Direct` (followed by space + Cyrillic letter, or by `,`, `.`, `)`, end-of-string, or newline; **and not followed by `.Pro`**) → `Директ`. The "not followed by `.Pro`" guard is already enforced by rule 1 running first.

To avoid corrupting words like `Directives` (none in our content, but worth guarding), the replacer matches `\bDirect\b` (word boundary on both sides) — Cyrillic neighbours count as word boundary in Unicode mode.

**b) Manual rewrites** in the one card whose content explicitly talks about the brand naming itself:

- `src/knowledge/direct-pro/cards/interface-surfaces.json` → card `concept_direct_vs_direct_pro` (around line 5–66): the `summary` and the `naming_collision` challenge rule talk about which brand strings are allowed. After mechanical replacement, manually verify that the rewritten text still says, in essence: "the only allowed customer-facing names are «Директ» and «Директ Про»; «Директ Лайт», «лёгкая версия», «упрощённая версия» are forbidden". Adjust phrasing where mechanical substitution produced awkwardness.

#### Tooling

A one-shot Node script (lives in `tools/direct-pro-knowledge/` for discoverability, named `rename-brand.mjs` or similar) walks the four card JSON files, applies the replacement rules **only** inside the whitelisted fields, leaves `references[]` untouched, and rewrites files in place. The script logs a per-field diff count. After review the script is **kept committed** (cheap, not generated, useful documentation of the rule). For TS/TSX files the changes are small enough to do via the editor.

#### Verification

- `npm run build` — TypeScript typecheck + Next.js production build.
- `npm test` — vitest run. Existing snapshot-style tests on schemas and prompts pass through; brand strings in tests (`select.test.ts` mentions «Директ Про» — already correct) need no change.
- Spot check: open the app locally, run evaluation on `epic2.md`, confirm UI looks right, confirm the markdown export shows «Директ Про».

## Trade-offs Considered

- **Why not a global sed across all .json/.ts?** The blast radius is too wide: it would corrupt code identifiers (`DirectProKnowledgeCard`, `selectDirectProCards`), `references[].label/location`, and the Brand Names card's intentional explanation. A whitelisted Node script is safer and self-documenting.
- **Why a single shared `openSet` for criteria + challenges?** Keeping two sets means two "Развернуть все" buttons or a button that has to coordinate both. One set means one button, one toggle, one source of truth — simpler, and the namespacing keeps IDs unambiguous.
- **Why `divide-y` instead of explicit `<hr>` between blocks?** Conditional rendering of blocks: if "Анализ" or "Хороший ответ" is missing, an explicit `<hr>` would orphan. `divide-y` paints lines only between actual rendered children.

## Acceptance

- Result page renders with both criteria and challenge cards collapsed by default.
- "Развернуть все" expands both sets; "Свернуть все" collapses both.
- Inside any expanded card, subheadings are bold dark text with a thin separator line between blocks.
- No user-facing string anywhere outputs `Direct.Pro` (latin form), except inside `references[].label` / `references[].location` of knowledge cards.
- `npm run build` and `npm test` pass.
