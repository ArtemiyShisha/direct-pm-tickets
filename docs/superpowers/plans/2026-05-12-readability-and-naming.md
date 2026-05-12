# Readability + «Директ Про» Rename Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the result page legible (collapsible challenges + bold subheadings + dividers) and unify all user-facing brand strings to «Директ Про» / «Директ».

**Architecture:** Two parallel tracks. Track A (terminology): a pure renamer function (TDD), an orchestrator that walks the four card JSON files only inside whitelisted content fields, plus targeted edits in TS prompts/exports/UI. Track B (UI): convert `ProductChallengeCard` to a Collapsible with a single shared `openSet` covering both cards and challenges, then restyle expanded bodies (bold dark subheadings, `divide-y` separators).

**Tech Stack:** TypeScript, Next.js 16 App Router, React 19, Tailwind v4, Vitest, `@base-ui/react` Collapsible, `tsx` for one-shot Node tooling.

**Reference spec:** `docs/superpowers/specs/2026-05-12-readability-and-naming-design.md`

---

### Task 1: Pure brand-rename function (TDD)

**Files:**
- Create: `src/lib/brand-rename.ts`
- Create: `src/lib/brand-rename.test.ts`

- [ ] **Step 1: Write the failing test**

Write `src/lib/brand-rename.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { renameBrandText } from "./brand-rename";

describe("renameBrandText", () => {
  it("replaces Direct.Pro with Директ Про", () => {
    expect(renameBrandText("В Direct.Pro есть фильтры")).toBe(
      "В Директ Про есть фильтры",
    );
  });

  it("replaces standalone Direct with Директ in flowing Cyrillic text", () => {
    expect(renameBrandText("Direct и Direct.Pro — две поверхности")).toBe(
      "Директ и Директ Про — две поверхности",
    );
  });

  it("replaces «Direct» (with guillemets) with «Директ»", () => {
    expect(renameBrandText('Названия «Direct» и «Direct.Pro»')).toBe(
      "Названия «Директ» и «Директ Про»",
    );
  });

  it("does not touch lowercase identifiers like direct_pro", () => {
    expect(renameBrandText("alias direct_pro and direct.pro")).toBe(
      "alias direct_pro and direct.pro",
    );
  });

  it("does not touch words that contain Direct as a substring", () => {
    expect(renameBrandText("Directives stay intact")).toBe(
      "Directives stay intact",
    );
  });

  it("leaves Light untouched in 'Direct Light' (manual rewrite handles that card)", () => {
    expect(renameBrandText('«Direct Light», «лёгкая версия»')).toBe(
      "«Директ Light», «лёгкая версия»",
    );
  });

  it("handles trailing punctuation around Direct", () => {
    expect(renameBrandText("по умолчанию — Direct.")).toBe(
      "по умолчанию — Директ.",
    );
    expect(renameBrandText("(Direct, Direct.Pro)")).toBe(
      "(Директ, Директ Про)",
    );
  });

  it("is idempotent on already-renamed text", () => {
    const renamed = "В Директ Про и Директ всё ок";
    expect(renameBrandText(renamed)).toBe(renamed);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/brand-rename.test.ts`
Expected: FAIL — `Cannot find module './brand-rename'`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/brand-rename.ts`:

```ts
/**
 * Replace user-facing brand strings:
 *   "Direct.Pro" → "Директ Про"
 *   "«Direct»"   → "«Директ»"
 *   standalone "Direct" (word boundary) → "Директ"
 *
 * Idempotent and safe for code-shaped tokens (`direct_pro`, `direct.pro`,
 * `Directives`) because:
 *   - the lowercase "direct" tokens are skipped by case-sensitive matching;
 *   - `Direct\.Pro` runs first and consumes the dotted form;
 *   - `\bDirect\b` requires word boundaries on both sides, so substrings
 *     inside identifiers are not matched.
 */
export function renameBrandText(input: string): string {
  return input
    .replace(/Direct\.Pro/g, "Директ Про")
    .replace(/«Direct»/g, "«Директ»")
    .replace(/\bDirect\b/g, "Директ");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/brand-rename.test.ts`
Expected: PASS — 8 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/brand-rename.ts src/lib/brand-rename.test.ts
git commit -m "feat(lib): add pure brand-rename helper

Pure text helper that rewrites Direct.Pro → Директ Про and standalone
Direct → Директ. Used by the JSON cards orchestrator and the targeted
TS string edits in the next tasks."
```

---

### Task 2: JSON cards rename orchestrator script

**Files:**
- Create: `tools/direct-pro-knowledge/rename-brand-cards.ts`

- [ ] **Step 1: Write the orchestrator**

Create `tools/direct-pro-knowledge/rename-brand-cards.ts`:

```ts
#!/usr/bin/env tsx
/**
 * One-shot rename: Direct.Pro → Директ Про across user-facing fields of
 * src/knowledge/direct-pro/cards/*.json.
 *
 * Whitelisted fields (per directProKnowledgeCardSchema):
 *   label, summary, aliases[], challengeRules[].trigger,
 *   challengeRules[].challenge.
 *
 * NOT touched:
 *   id, kind, entityLevel, appliesToCampaignTypes, surfaces, relatedCards,
 *   challengeRules[].id, challengeRules[].severity, sourceRefs[].* (formal
 *   source labels and file paths), confidence.
 *
 * Idempotent. Run via:
 *   npx tsx tools/direct-pro-knowledge/rename-brand-cards.ts
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renameBrandText } from "../../src/lib/brand-rename";

interface ChallengeRule {
  id: string;
  trigger: string;
  challenge: string;
  severity: string;
}

interface Card {
  id: string;
  label: string;
  aliases: string[];
  summary: string;
  challengeRules?: ChallengeRule[];
  [key: string]: unknown;
}

const CARDS_DIR = "src/knowledge/direct-pro/cards";

function transformCard(card: Card): { card: Card; changes: number } {
  let changes = 0;
  const wrap = (value: string): string => {
    const next = renameBrandText(value);
    if (next !== value) changes += 1;
    return next;
  };

  card.label = wrap(card.label);
  card.summary = wrap(card.summary);
  card.aliases = card.aliases.map(wrap);
  if (card.challengeRules) {
    card.challengeRules = card.challengeRules.map((rule) => ({
      ...rule,
      trigger: wrap(rule.trigger),
      challenge: wrap(rule.challenge),
    }));
  }
  return { card, changes };
}

function main(): void {
  const files = readdirSync(CARDS_DIR).filter((name) => name.endsWith(".json"));
  for (const name of files) {
    const path = join(CARDS_DIR, name);
    const cards = JSON.parse(readFileSync(path, "utf8")) as Card[];
    let total = 0;
    const next = cards.map((c) => {
      const { card, changes } = transformCard(c);
      total += changes;
      return card;
    });
    writeFileSync(path, JSON.stringify(next, null, 2) + "\n");
    console.log(`${name}: ${total} field(s) updated`);
  }
}

main();
```

- [ ] **Step 2: Smoke-test the script (dry-run on real cards)**

Run: `npx tsx tools/direct-pro-knowledge/rename-brand-cards.ts`

Expected output (counts will vary):

```
campaign-group-settings.json: <N1> field(s) updated
campaign-hierarchy.json: <N2> field(s) updated
campaign-types.json: <N3> field(s) updated
interface-surfaces.json: <N4> field(s) updated
```

After running, inspect git diff with: `git diff --stat src/knowledge/direct-pro/cards/`

Expected: 4 files modified, no `sourceRefs` lines touched.

- [ ] **Step 3: Sanity-check the diff for whitelisted fields only**

Run: `git diff src/knowledge/direct-pro/cards/ | grep -E '^[-+]' | grep -E 'sourceRefs|"location"|"reviewedBy"|"label": "internal' | head`

Expected: NO output (no lines under `sourceRefs` were modified).

If output appears, the orchestrator touched something it shouldn't — revert and fix the script before continuing:

```bash
git checkout src/knowledge/direct-pro/cards/
```

- [ ] **Step 4: Run idempotency check**

Run the script a second time: `npx tsx tools/direct-pro-knowledge/rename-brand-cards.ts`
Expected: every file reports `0 field(s) updated`. Run `git diff --stat` again — no new changes since the previous run.

- [ ] **Step 5: Commit script + JSON updates together**

```bash
git add tools/direct-pro-knowledge/rename-brand-cards.ts src/knowledge/direct-pro/cards/
git commit -m "refactor(knowledge): rename Direct.Pro → Директ Про in card content

Mechanical rename across whitelisted user-facing fields (label, summary,
aliases, challengeRules.trigger, challengeRules.challenge) of the four
runtime knowledge JSON files. sourceRefs are intentionally left intact
because their labels and locations are formal source identifiers.

The renamer (tools/direct-pro-knowledge/rename-brand-cards.ts) is kept
in repo as documentation of the rule and is idempotent."
```

---

### Task 3: Manual rewrite of the brand-naming card

**Files:**
- Modify: `src/knowledge/direct-pro/cards/interface-surfaces.json` — only the card with `id: "concept_direct_vs_direct_pro"` (top of the file, around lines 3–66).

This card explains the brand naming rules. After Task 2, mechanical replacement produced text like `«Директ Light»` (it should read «Директ Лайт»), and the summary now lists allowed names as «Директ» and «Директ Про» which is correct, but check phrasing for clumsiness.

- [ ] **Step 1: Read the current state of the card**

Open `src/knowledge/direct-pro/cards/interface-surfaces.json` and read the FIRST card (`concept_direct_vs_direct_pro`).

Verify two specific places:
1. `summary` field — the phrase that lists allowed customer-facing names.
2. `challengeRules[]` — the rule with `id` mentioning `naming` (around `trigger: "Эпик использует термины «Direct Light» ..."`).

- [ ] **Step 2: Apply manual fixes**

Use the editor to make these specific edits inside that single card:

a) In the `summary`, change `«Директ Light»` (post-rename artefact) → `«Директ Лайт»`. Keep the meaning: "the only allowed customer-facing names are «Директ» and «Директ Про»; «Директ Лайт», «лёгкая версия», «упрощённая версия» are forbidden."

b) In the `naming_collision` (or similarly-named) challenge rule, the `trigger` should now read:

```
"Эпик использует термины «Директ Лайт», «лёгкая версия», «упрощённая версия» в communication-копии или интерфейсе."
```

And the `challenge` should still say (substantially):

```
"Эти названия запрещены в коммуникации с клиентами. Допустимы только «Директ» и «Директ Про». UI-тексты, e-mail рассылки, сообщения в чате — везде нужно следить за терминологией."
```

c) Skim the rest of the card body — if any sentence reads awkwardly after the mechanical replacement (e.g. orphan capital letters, double spaces), fix it.

- [ ] **Step 3: Validate the JSON parses and passes the schema**

Run: `npx tsx tools/direct-pro-knowledge/validate-candidates.ts interface-surfaces-v1`

Expected: validator prints "OK" / no errors. (If the script targets drafts only, fall back to: `npx tsx -e "import('./src/knowledge/direct-pro/cards/interface-surfaces.json', { with: { type: 'json' } }).then(m => console.log('cards:', m.default.length))"` to confirm it parses.)

- [ ] **Step 4: Commit**

```bash
git add src/knowledge/direct-pro/cards/interface-surfaces.json
git commit -m "fix(knowledge): hand-edit naming card after mechanical rename

The concept_direct_vs_direct_pro card explains which brand strings are
allowed/forbidden in customer communication, so the mechanical rename
produced «Директ Light» and similar awkwardness. Rewrites those mentions
to «Директ Лайт» and tidies adjacent phrasing."
```

---

### Task 4: Brand rename in TS — prompts, markdown export, UI labels (TDD where tests exist)

**Files:**
- Modify: `src/components/evaluation-result.tsx` (2 string literals)
- Modify: `src/lib/export-markdown.ts` (2 string literals)
- Modify: `src/prompts/product-challenger-prompt.ts` (4 occurrences)
- Test:   `src/lib/export-markdown.test.ts` (extend)
- Test:   `src/prompts/product-challenger-prompt.test.ts` (extend)

- [ ] **Step 1: Add a failing test in `export-markdown.test.ts`**

At the bottom of the existing `describe("exportToMarkdown", () => {...})` block, add:

```ts
  it("uses «Директ Про» (Cyrillic) in the challenges section header and field labels", () => {
    const challenge: ProductChallenge = {
      type: "question",
      severity: "high",
      target: "Сценарий копирования",
      observation: "Не описан flow для скопированных кампаний.",
      direct_context: "В Директ Про копирование сохраняет ID.",
      why_it_matters: "Иначе сломаются отчёты.",
      question: "Что происходит со связями?",
      good_answer: "Сохранять явный маппинг.",
      related_criteria: [],
      knowledge_card_ids: [],
    };
    const md = exportToMarkdown(makeResult([challenge]));
    expect(md).toContain("в контексте Директ Про");
    expect(md).toContain("**Контекст Директ Про:**");
    expect(md).not.toContain("Direct.Pro");
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/export-markdown.test.ts`
Expected: FAIL — string `Direct.Pro` is still present in output.

- [ ] **Step 3: Apply the rename in `export-markdown.ts`**

In `src/lib/export-markdown.ts`:

```ts
  lines.push(
    `_Не влияют на оценку. Вопросы и риски к продуктовой идее в контексте Директ Про._`,
    ``,
  );
```

```ts
    if (challenge.direct_context) {
      lines.push(`**Контекст Директ Про:** ${challenge.direct_context}`);
    }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/export-markdown.test.ts`
Expected: PASS — all tests green.

- [ ] **Step 5: Add a failing test in `product-challenger-prompt.test.ts`**

At the bottom of the existing `describe(...)` block, add:

```ts
  it("uses «Директ Про» (Cyrillic) in the system prompt header", () => {
    const prompt = buildProductChallengerPrompt(preAnalysis, criteria, [card]);
    expect(prompt).toContain("Директ Про Product Challenger");
    expect(prompt).toContain("в контексте Директ Про");
    expect(prompt).toContain("APPROVED ДИРЕКТ ПРО CARDS:");
    expect(prompt).not.toContain("Direct.Pro");
  });
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npx vitest run src/prompts/product-challenger-prompt.test.ts`
Expected: FAIL — `Direct.Pro` is still present in the prompt.

- [ ] **Step 7: Apply the rename in `product-challenger-prompt.ts`**

In `src/prompts/product-challenger-prompt.ts` replace the four hard-coded `Direct.Pro` occurrences:

```ts
  return `Ты — Директ Про Product Challenger. Ты не ставишь оценку и не пересчитываешь score.

Твоя задача — найти вопросы, риски и противоречия к самой продуктовой идее в контексте Директ Про.
Челлендж может появиться даже если формальные критерии получили высокий score.

Используй только:
- текст эпика;
- автоматический pre-analysis;
- summary оценок;
- approved Директ Про knowledge cards ниже.

Не выдумывай факты о Директ Про сверх карточек. Если знания не хватает, формулируй вопрос как проверку допущения, а не как утверждение.

...

APPROVED ДИРЕКТ ПРО CARDS:
${cardBlock}`;
```

(Keep the rest of the prompt body unchanged. The `${cardBlock}` substitution and earlier sections stay.)

- [ ] **Step 8: Run the test to verify it passes**

Run: `npx vitest run src/prompts/product-challenger-prompt.test.ts`
Expected: PASS.

- [ ] **Step 9: Apply the rename in `evaluation-result.tsx`**

Two literal edits, no test layer for UI strings (no testing-library in this repo):

In `ProductChallengeCard`, replace the field label:

```tsx
        {challenge.direct_context && (
          <div>
            <div className="text-xs font-medium text-black/60 mb-0.5">
              Контекст Директ Про
            </div>
            <p>{challenge.direct_context}</p>
          </div>
        )}
```

In `ProductChallengesSection`, replace the intro paragraph:

```tsx
      <p className="px-1 text-xs text-muted-foreground">
        Вопросы и риски к продуктовой идее в контексте Директ Про. Появляются
        даже когда формальные критерии зелёные.
      </p>
```

(Note: the subheading style change happens in Task 7. This step is a string-only edit.)

- [ ] **Step 10: Run full test suite + grep for stragglers**

Run: `npm test`
Expected: all 6 test files pass, including the two extended ones.

Run: `rg -n "Direct\.Pro" src/`
Expected: only TypeScript identifier mentions (`DirectProKnowledgeCard`, `selectDirectProCards`, `INTERFACE_SURFACES_DIRECT_PRO_CARDS`, etc.) and the schema/test files using those identifiers. **No** user-facing string content.

If any user-facing string remains, fix it now.

- [ ] **Step 11: Commit**

```bash
git add src/lib/export-markdown.ts src/lib/export-markdown.test.ts \
        src/prompts/product-challenger-prompt.ts \
        src/prompts/product-challenger-prompt.test.ts \
        src/components/evaluation-result.tsx
git commit -m "refactor(ui): rename Direct.Pro → Директ Про in TS user-facing strings

Covers product-challenger system prompt, markdown export labels and the
result page strings. Backed by extended tests for the prompt and the
markdown exporter."
```

---

### Task 5: Make `ProductChallengeCard` collapsible + share `openSet`

**Files:**
- Modify: `src/components/evaluation-result.tsx`

This task changes the component structure of `ProductChallengeCard` and rewires `EvaluationResultView` so the "Развернуть/Свернуть все" button controls both criterion and challenge cards.

- [ ] **Step 1: Replace `ProductChallengeCard` with a collapsible version**

Replace the whole `ProductChallengeCard` function definition with:

```tsx
function ProductChallengeCard({
  challenge,
  isOpen,
  onOpenChange,
}: {
  challenge: ProductChallenge;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const severity = challengeSeverityConfig[challenge.severity];
  const typeMeta = challengeTypeConfig[challenge.type];
  const TypeIcon = typeMeta.Icon;

  const relatedLabels = challenge.related_criteria
    .map((id) => CRITERIA.find((c) => c.id === id)?.label ?? id)
    .filter(Boolean);

  const preview = challenge.question ?? challenge.observation ?? "";
  const hasBody =
    Boolean(challenge.observation) ||
    Boolean(challenge.direct_context) ||
    Boolean(challenge.why_it_matters) ||
    Boolean(challenge.question) ||
    Boolean(challenge.good_answer) ||
    relatedLabels.length > 0 ||
    challenge.knowledge_card_ids.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger
        className={`flex w-full flex-col gap-1 rounded-lg border border-l-4 bg-white px-4 py-3 text-left transition-colors hover:bg-muted/50 data-[open]:rounded-b-none data-[open]:border-b-0 ${severity.border}`}
      >
        <div className="flex w-full items-center gap-2">
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform [[data-open]>&]:rotate-90" />
          <Badge variant={severity.badgeVariant} className="text-xs shrink-0">
            {severity.label}
          </Badge>
          <Badge variant="outline" className="text-xs shrink-0">
            <TypeIcon className="h-3 w-3" />
            {typeMeta.label}
          </Badge>
          {challenge.target && (
            <span className="text-sm font-medium text-foreground shrink-0">
              {challenge.target}
            </span>
          )}
        </div>

        {preview && (
          <p className="ml-7 text-xs text-black/70 leading-relaxed line-clamp-2">
            {preview}
          </p>
        )}
      </CollapsibleTrigger>

      {hasBody && (
        <CollapsibleContent
          className={`rounded-b-lg border border-t-0 border-l-4 bg-white px-4 pb-4 pt-3 ${severity.border}`}
        >
          <div className="divide-y divide-border space-y-0">
            {challenge.observation && (
              <div className="space-y-1 pb-3 first:pt-0 pt-3">
                <div className="text-sm font-semibold text-foreground">
                  Что заметили
                </div>
                <p className="text-sm text-black leading-relaxed">
                  {challenge.observation}
                </p>
              </div>
            )}
            {challenge.direct_context && (
              <div className="space-y-1 pb-3 pt-3 first:pt-0">
                <div className="text-sm font-semibold text-foreground">
                  Контекст Директ Про
                </div>
                <p className="text-sm text-black leading-relaxed">
                  {challenge.direct_context}
                </p>
              </div>
            )}
            {challenge.why_it_matters && (
              <div className="space-y-1 pb-3 pt-3 first:pt-0">
                <div className="text-sm font-semibold text-foreground">
                  Почему это важно
                </div>
                <p className="text-sm text-black leading-relaxed">
                  {challenge.why_it_matters}
                </p>
              </div>
            )}
            {challenge.question && (
              <div className="space-y-1 pb-3 pt-3 first:pt-0">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <MessageCircleQuestion className="h-3 w-3 text-muted-foreground" />
                  Вопрос к PM
                </div>
                <p className="text-sm font-medium text-black leading-relaxed">
                  {challenge.question}
                </p>
              </div>
            )}
            {challenge.good_answer && (
              <div className="space-y-1 pb-3 pt-3 first:pt-0">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <ClipboardCheck className="h-3 w-3 text-muted-foreground" />
                  Хороший ответ выглядит так
                </div>
                <p className="text-sm text-black/80 leading-relaxed">
                  {challenge.good_answer}
                </p>
              </div>
            )}
            {(relatedLabels.length > 0 ||
              challenge.knowledge_card_ids.length > 0) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-3">
                {relatedLabels.map((label) => (
                  <Badge
                    key={`crit-${label}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {label}
                  </Badge>
                ))}
                {challenge.knowledge_card_ids.map((id) => (
                  <Badge
                    key={`card-${id}`}
                    variant="ghost"
                    className="text-xs font-mono"
                  >
                    {id}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
```

- [ ] **Step 2: Update `ProductChallengesSection` to pass open state down**

Replace the body of `ProductChallengesSection` to accept and forward open state. Replace its whole function with:

```tsx
function ProductChallengesSection({
  challenges,
  isOpen,
  onItemOpenChange,
}: {
  challenges: ProductChallenge[];
  isOpen: (id: string) => boolean;
  onItemOpenChange: (id: string, open: boolean) => void;
}) {
  const sorted = [...challenges].sort((a, b) => {
    const order: Record<ProductChallenge["severity"], number> = {
      high: 0,
      medium: 1,
      low: 2,
    };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between px-1">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-foreground">
            Продуктовые челленджи
          </h3>
          <span className="text-xs text-muted-foreground">
            {challenges.length}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Не влияют на оценку
        </span>
      </div>
      <p className="px-1 text-xs text-muted-foreground">
        Вопросы и риски к продуктовой идее в контексте Директ Про. Появляются
        даже когда формальные критерии зелёные.
      </p>
      <div className="space-y-2">
        {sorted.map((challenge, i) => {
          const id = `chal-${i}`;
          return (
            <ProductChallengeCard
              key={id}
              challenge={challenge}
              isOpen={isOpen(id)}
              onOpenChange={(open) => onItemOpenChange(id, open)}
            />
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire shared `openSet` in `EvaluationResultView`**

Inside `EvaluationResultView`, replace the existing `openSet` block with the shared version:

```tsx
  const criteriaIds = result.criteria.map((c) => `crit-${c.id}`);
  const challengeIds = (result.product_challenges ?? []).map(
    (_, i) => `chal-${i}`,
  );
  const allIds = [...criteriaIds, ...challengeIds];

  const [openSet, setOpenSet] = useState<Set<string>>(() => new Set());

  const allExpanded = openSet.size === allIds.length && allIds.length > 0;

  const toggleAll = useCallback(() => {
    setOpenSet((prev) =>
      prev.size === allIds.length ? new Set() : new Set(allIds),
    );
  }, [allIds]);

  const setOne = useCallback((id: string, open: boolean) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const isOpen = useCallback((id: string) => openSet.has(id), [openSet]);
```

- [ ] **Step 4: Forward open state to both sections**

Update the rendering inside `EvaluationResultView`:

For the challenges section:

```tsx
      {result.product_challenges && result.product_challenges.length > 0 && (
        <ProductChallengesSection
          challenges={result.product_challenges}
          isOpen={isOpen}
          onItemOpenChange={setOne}
        />
      )}
```

For the criterion cards inside the groups loop, change the prop wiring to use namespaced ids:

```tsx
              {groupCriteria.map((criterion) => {
                const id = `crit-${criterion.id}`;
                return (
                  <CriterionCard
                    key={criterion.id}
                    criterion={criterion}
                    isOpen={isOpen(id)}
                    onOpenChange={(open) => setOne(id, open)}
                  />
                );
              })}
```

- [ ] **Step 5: Build and typecheck**

Run: `npm run build`
Expected: build succeeds, no TypeScript errors. (The `CriterionCard` signature still takes `isOpen: boolean` and `onOpenChange: (open: boolean) => void` — no signature changes needed there.)

- [ ] **Step 6: Manual smoke test**

Start dev server: `npm run dev` (skip if user is running it; otherwise stop after smoke).
- Open `http://localhost:3000`.
- Paste `epic2.md` content into the form, submit.
- After result renders: confirm all challenge cards are collapsed by default and show severity + type + target + 1–2 line preview.
- Click a challenge — it expands with subheaded sections.
- Click "Развернуть все" — both criteria and challenges expand. Click again — both collapse.

- [ ] **Step 7: Commit**

```bash
git add src/components/evaluation-result.tsx
git commit -m "feat(ui): make product challenges collapsible and share open state

ProductChallengeCard now uses the same Collapsible pattern as
CriterionCard. EvaluationResultView keeps a single openSet keyed by
namespaced ids (crit-* / chal-*); the 'Развернуть/Свернуть все' button
controls both card types together so neither section visually
dominates."
```

---

### Task 6: Bold subheadings + dividers inside CriterionCard expanded body

**Files:**
- Modify: `src/components/evaluation-result.tsx` — `CriterionCard` body and `FoundMissingLists`.

- [ ] **Step 1: Restyle `FoundMissingLists` headings**

Replace the two heading divs (currently `text-xs font-medium text-emerald-700` / `text-red-700`) with stronger typography while keeping their semantic colour:

```tsx
function FoundMissingLists({ criterion }: { criterion: CriterionResult }) {
  const hasFound = criterion.found_items && criterion.found_items.length > 0;
  const hasMissing =
    criterion.missing_items && criterion.missing_items.length > 0;

  if (!hasFound && !hasMissing) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {hasFound && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <CircleCheck className="h-3 w-3" />
            Найдено в эпике
          </div>
          <ul className="space-y-1">
            {criterion.found_items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="text-black">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasMissing && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-red-700">
            <CircleX className="h-3 w-3" />
            Не хватает
          </div>
          <ul className="space-y-1">
            {criterion.missing_items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span className="text-black">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Restyle CriterionCard body subheadings + add dividers**

In `CriterionCard`, replace the `CollapsibleContent` body with the divided + bolded version:

```tsx
      {hasDetails && (
        <CollapsibleContent
          className={`rounded-b-lg border border-t-0 border-l-4 bg-white px-4 pb-4 pt-3 ${config.border}`}
        >
          <div className="divide-y divide-border">
            {criterion.analysis && (
              <div className="space-y-1 pb-3 first:pt-0 pt-3">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Search className="h-3 w-3 text-muted-foreground" />
                  Анализ
                </div>
                <p className="text-sm text-black leading-relaxed">
                  {criterion.analysis}
                </p>
              </div>
            )}

            <div className="pb-3 pt-3 first:pt-0">
              <FoundMissingLists criterion={criterion} />
            </div>

            {hasQuestions && (
              <div className="space-y-1.5 pb-3 pt-3 first:pt-0">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <MessageCircleQuestion className="h-3 w-3 text-muted-foreground" />
                  Вопросы к PM
                </div>
                <ol className="space-y-1 pl-1">
                  {criterion.questions.map((q, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold tabular-nums text-black">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 text-black">{q}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {hasSuggestion && (
              <div className="space-y-1.5 pt-3 first:pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Lightbulb className="h-3 w-3 text-muted-foreground" />
                    Черновик для вставки
                  </div>
                  <CopyButton text={criterion.suggestion!} />
                </div>
                <div className="rounded-md bg-muted/60 px-3 py-2 text-sm text-black leading-relaxed whitespace-pre-wrap border">
                  {criterion.suggestion}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      )}
```

Note the wrapper change: `space-y-4` is removed; spacing is now handled by `pb-3 pt-3 first:pt-0` per child plus the `divide-y` border between siblings. The `FoundMissingLists` block is wrapped in its own divider container so it participates in `divide-y` as a single sibling.

Edge case: if `criterion.found_items` and `criterion.missing_items` are both empty, `FoundMissingLists` returns `null`, but its wrapper div would still render an empty divided cell. Guard against that:

```tsx
            {(criterion.found_items?.length ?? 0) +
              (criterion.missing_items?.length ?? 0) >
              0 && (
              <div className="pb-3 pt-3 first:pt-0">
                <FoundMissingLists criterion={criterion} />
              </div>
            )}
```

Use this guarded version in place of the unconditional one.

- [ ] **Step 3: Build + typecheck**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual smoke test**

In the running dev server, expand a criterion card with non-empty `analysis`, `found_items`, `missing_items`, `questions` and `suggestion`. Confirm:
- Subheadings («Анализ», «Найдено в эпике», «Не хватает», «Вопросы к PM», «Черновик для вставки») are bold and dark.
- Thin neutral lines separate each block.
- A criterion with only `analysis` and `questions` (no found/missing, no suggestion) shows exactly one divider between them, no orphan empty cells.

- [ ] **Step 5: Commit**

```bash
git add src/components/evaluation-result.tsx
git commit -m "feat(ui): bold dark subheadings + dividers inside criterion cards

Replaces the muted xs subheadings with sm semibold foreground headings
and threads divide-y through the conditional child blocks. Empty
found/missing block is suppressed so divide-y does not paint phantom
separators."
```

---

### Task 7: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: 6+ test files pass; 20+ tests; no failures. (Two new tests added in Task 4 raise the count.)

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: success, no TypeScript errors, no Next.js warnings about static rendering.

- [ ] **Step 3: Brand-string audit**

Run: `rg -n '"[^"]*Direct\.Pro' src/`
Expected: only matches that are inside `references[].label` of card JSON files (i.e. `"label": "internal Direct.Pro support page ..."`) — those are intentional formal source identifiers.

Run: `rg -n '\bDirect\b' src/ --glob '!**/*.test.*'`
Expected: only TypeScript identifiers (`DirectProKnowledgeCard`, `selectDirectProCards`, `INTERFACE_SURFACES_DIRECT_PRO_CARDS`, `DirectProduct`, `DIRECT_PRODUCTS`, etc.). No standalone `Direct` in user-facing string content.

- [ ] **Step 4: Manual smoke**

If dev server is up, run an evaluation on `epic2.md` end-to-end. Confirm:
- All challenge cards collapsed by default; clicking expands with bold subheadings + separators.
- "Развернуть все" / "Свернуть все" toggles both criteria and challenges together.
- The "Контекст Директ Про" label appears (not "Контекст Direct.Pro").
- Markdown export (download .md) shows "**Контекст Директ Про:**".

- [ ] **Step 5: Push (only if all of the above passed)**

```bash
git push
```

Then watch Railway build logs to confirm the deploy succeeds.

---

## Self-Review Checklist (executed during plan authoring)

- **Spec coverage:**
  - UI 1.1 (collapsible challenges + shared openSet) → Task 5.
  - UI 1.2 (bold subheadings + divide-y for criterion + challenge bodies) → Task 5 (challenge body, included with collapsible refactor) + Task 6 (criterion body + FoundMissingLists).
  - UI 1.3 (markdown export — terminology only, no layout) → Task 4 (test + edit).
  - Naming part 2a (mechanical replacements):
    - `evaluation-result.tsx` → Task 4 step 9.
    - `export-markdown.ts` → Task 4 steps 1–4.
    - `product-challenger-prompt.ts` → Task 4 steps 5–8.
    - `pre-analysis-prompt.ts` → no change needed (already on Russian); verified at audit step in Task 7.
    - `direct-context.ts` → no change needed (already on Russian); covered by audit grep in Task 7 step 3.
    - card JSONs → Task 2.
    - `epic-template.ts` → no change needed; covered by audit.
  - Naming part 2b (manual rewrite of `concept_direct_vs_direct_pro`) → Task 3.
  - Tooling (rename script committed) → Task 2 step 5.
  - Verification (`npm run build`, `npm test`, manual QA) → Task 7.
- **Placeholder scan:** No "TBD"/"TODO"/"add appropriate" placeholders. All steps include exact file paths and concrete code.
- **Type consistency:** `CriterionCard` props (`isOpen`, `onOpenChange`) unchanged across tasks. `ProductChallengeCard` gains the same two props in Task 5 and they stay consistent in Task 4 step 9 (string-only edits, no signature change at that point — Task 4 strings live inside the OLD signature, the signature change happens cleanly in Task 5). `renameBrandText` returns `string`; orchestrator script imports it from `src/lib/brand-rename` and uses it as `(value: string) => string`.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-12-readability-and-naming.md`. Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
