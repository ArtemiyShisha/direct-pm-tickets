# Контекст проекта Epic Reviewer

## Суть проекта

Инструмент автоматической оценки эпиков Яндекс Директа по 14 продуктовым критериям. PM вставляет текст эпика → система делает Pre-Analysis → параллельно оценивает 3 группы критериев через `gpt-5.5` (с подмешанным контекстом Direct.Pro из knowledge cards) → выдаёт баллы, директо-aware вопросы и черновики. Отдельный шаг Direct.Pro Product Challenger остался как опциональный legacy-путь под флагом `PRODUCT_CHALLENGER_ENABLED=true`; по умолчанию выключен, потому что директо-знания теперь питают сами оценщики через `buildGroupPrompt`.

**Стек**: Next.js 16, TypeScript, Tailwind + shadcn/ui, OpenAI `gpt-5.5` (один константный `EVALUATION_MODEL` в `src/lib/openai.ts`), Zod 4, Vitest.
**Деплой**: Railway, автодеплой из `main`.
**Репо**: https://github.com/ArtemiyShisha/direct-pm-tickets

---

## Проделанная работа по калибровке оценки

### Проблема

Первая версия промпта давала слишком низкие оценки (36-56 баллов) для эпиков, которые по экспертной оценке были хорошими (ожидание ~80+). Основные причины:

1. Промпт содержал «Будь строгим» и «Оценивай СТРОГО по тексту. Не додумывай» — LLM штрафовал за отсутствие формально выделенных секций, даже если информация следовала из контекста.
2. Шкала была завышена: 6 = «базовый уровень», 7-8 = «хорошо» — для хорошего эпика нужно было набрать 8+ по большинству критериев, что нереалистично.
3. Некоторые критерии неприменимы к определённым типам эпиков (например, «Потенциал» для комплаенс-эпика), но LLM ставил 0-2 вместо N/A.
4. Веса не отражали приоритеты: Дизайн и Сценарии были недооценены.

### Что было сделано

#### Раунд 1: Смягчение требований и веса (коммит `f64801f`)

- **Вес Дизайна**: 0.7 → 1.0
- **Вес Сценариев**: 1.0 → 1.5
- Смягчены описания критериев:
  - `logging`: достаточно списка событий, формат/retention не нужны
  - `ready_for_dev`: продуктовая полнота, не техническая спецификация
  - `design`: ссылка на Figma засчитывается, даже если визуально не проверяема
- Добавлено правило «Это продуктовый ревью, не технический»

**Результат**: оценки поднялись незначительно (36→39, 46→48, 56→61).

#### Раунд 2: Поддержка N/A (коммит `85383d1`)

- Введён статус N/A (`score = -1`) для неприменимых критериев
- Изменены типы: `Status = "ok" | "partial" | "fail" | "na"`
- Zod/JSON Schema: `minimum: 0` → `minimum: -1`
- `calculateTotalScore` исключает N/A-критерии из расчёта
- UI: серый бейдж "N/A", корректное отображение
- Markdown-экспорт обновлён

**Результат**: N/A-функциональность работает, но LLM по-прежнему ставил 0-3 вместо -1, потому что инструкция была слишком мягкой («может быть N/A»).

#### Раунд 3: Рекалибровка промпта (коммит `19b68c5`)

Полная переработка `BASE_PROMPT`:

- **Убрана строгость**: «Будь строгим» удалено, вместо этого «Учитывай контекст»
- **Контекстный кредит**: если информация очевидно следует из эпика — засчитывается (комплаенс → регуляторный триггер = проблема; миграция → legacy = проблема)
- **Новый главный вопрос**: «Достаточно ли описания, чтобы команда могла начать работу? Если да — 7+»
- **Явные триггеры N/A** для каждого критерия (potential, analytics, design, onboarding, international) с конкретными условиями
- **Новая шкала**: `6-7 = достаточно для работы команды` (вместо `6 = базовый, 7-8 = хорошо`)
- **Few-shot пример** регуляторного эпика с контекстным кредитом (score 7)
- Обновлены описания: `problem` (контекст комплаенс/миграций), `scenarios` (бизнес-логика засчитывается), `launch` (фичефлаги = 5-6 баллов)

**Результат**: задеплоено, ожидает тестирования.

---

## Текущее состояние

### Что задеплоено и работает

- 14 критериев в 3 группах, 3 параллельных вызова `gpt-5.5` (унифицирован через `EVALUATION_MODEL`).
- Step 0: Pre-Analysis (`runPreAnalysis`) с автоопределением типа эпика, продуктов и N/A-критериев.
- Knowledge cards: `selectDirectProCards(epicText)` поднят на уровень роута. Отобранные карточки прокидываются в каждую из 3 групп через `buildGroupPrompt(groupId, preAnalysis, cards)` — секция «КОНТЕКСТ ДИРЕКТ ПРО» (id+kind+label+summary + challenge rules) добавляется в системный промпт и инструктирует модель формулировать `criterion.questions` с опорой на эти знания.
- Runtime context now includes 116 Direct.Pro cards: 3 core seed cards plus promoted `review_needed` packs for campaign types (8), campaign hierarchy/lifecycle (13), campaign/group settings (16), interface surfaces (16), ad formats/elements (25), formats/shows (17), and targeting/semantics (18).
- Step 4 (legacy, OFF by default): Direct.Pro Product Challenger (`runProductChallenger`) — отдельный LLM-вызов под флагом `PRODUCT_CHALLENGER_ENABLED=true`. Когда выключен, в API возвращается `product_challenges: []`, UI/markdown-секция автоматически скрывается. Когда включён — работает как раньше: structured output, до 12 челленджей, не пересчитывает score, скипается при пустом наборе карточек.
- Веса: x1.5 (problem, solution, metrics, scenarios, ready_for_dev), x1.0 (potential, analytics, design, corner_cases, launch), x0.7 (onboarding, interfaces, international, logging).
- N/A-поддержка в типах, схемах, UI, экспорте.
- Контекстный кредит и явные N/A-триггеры в промпте.
- Продуктово-ориентированная шкала (6-7 = достаточно для работы).
- UI отдельной секцией показывает "Продуктовые челленджи" с пометкой "Не влияют на оценку"; markdown-экспорт включает ту же секцию.
- Vitest c `npm test` / `npm run test:watch`; на текущей ветке `npx vitest run` зелёный: 49/49 tests.

### Раунд 4: Pre-Analysis Pipeline

Добавлен предварительный шаг анализа (Step 0) перед основной оценкой. Решает 4 проблемы:

1. **Неприменимые критерии** — Pre-Analysis определяет какие критерии N/A для данного эпика на основе карты продуктов Директа
2. **Занижение скора** — N/A-критерии из Pre-Analysis форсируются (score = -1), даже если LLM проигнорировал инструкцию
3. **Галлюцинация требований** — контекст продукта (какие интерфейсы есть/нет) передаётся в оценочные промпты
4. **"Решение" слишком общее** — критерий переформулирован: оценивается краткий саммари из верхнего раздела, а не весь эпик

Новый пайплайн: текст эпика → Step 0 (Pre-Analysis) → Steps 1-3 (оценка по группам с контекстом) → форсирование N/A → скор.

**Новые файлы:**
- `src/knowledge/direct-context.ts` — карта продуктов Директа (12 продуктов, интерфейсы, рынки, роли, площадки)
- `src/prompts/pre-analysis-prompt.ts` — промпт для Step 0
- `src/lib/pre-analysis-schema.ts` — Zod + JSON Schema для Pre-Analysis

**Результат**: задеплоено.

### Раунд 5: Direct.Pro Product Challenger

Добавлен Step 4 — отдельный LLM-вызов, который ищет вопросы, риски и противоречия к продуктовой идее в контексте Direct.Pro. Не пересчитывает score и не заменяет существующий блок "Вопросы к PM" по 14 критериям — это **отдельный слой** продуктовых челленджей.

Архитектура спроектирована безопасно для Railway:

- Raw Arcadia/Wiki-выгрузки и приватные пути остаются локально (см. `.gitignore` под `/knowledge/...` и `/work/direct-pro-knowledge/`). В рантайм идут только sanitized карточки из `src/knowledge/direct-pro/cards/`.
- Селектор `selectDirectProCards` детерминированно матчит aliases карточек к тексту эпика. Если совпадений нет — LLM-вызов Challenger **скипается**, в API возвращается `product_challenges: []`. На существующий блок "Вопросы к PM" это никак не влияет (он генерится отдельными вызовами Pre-Analysis + 3 групп).
- В прод-промпт Challenger'у передаются только релевантные карточки. Сам промпт явно запрещает выдумывать факты о Direct.Pro сверх этих карточек: если знаний не хватает, модель формулирует вопрос как проверку допущения.
- Любая ошибка Challenger'а ловится и логируется; основной ответ оценки уходит как обычно.

Карточки знания уже вышли за пределы минимального seed-набора: в runtime подключены core cards и семь доменных packs. Все новые packs пока `confidence: "review_needed"` — это значит, что они прошли human review на пригодность для runtime, но не являются product-owner-approved фактами. Реальная польза теперь приходит через вопросы внутри 14 критериев, потому что карточки подмешиваются в group evaluator prompts.

**Новые файлы:**

- `src/knowledge/direct-pro/schema.ts` — Zod-схема одобренной карточки знания + типы (kind, severity, confidence, entity level, challenge rule, source ref).
- `src/knowledge/direct-pro/cards/core.ts` + `cards/index.ts` — три entity-карточки и общий barrel `DIRECT_PRO_KNOWLEDGE_CARDS`.
- `src/knowledge/direct-pro/select.ts` — детерминированный селектор по aliases (`toLocaleLowerCase("ru-RU")` + `String.includes`).
- `src/lib/product-challenger-schema.ts` — Zod + OpenAI strict `json_schema` (`productChallengerJsonSchema`).
- `src/prompts/product-challenger-prompt.ts` — билдер промпта для Challenger из pre-analysis + criteria summary + выбранных карточек.
- `src/app/api/evaluate/route.ts` — функция `runProductChallenger` после `forceNaCriteria` + totalScore; обёрнута в try/catch.
- `src/components/evaluation-result.tsx` — секция "Продуктовые челленджи" над группами критериев, явно помеченная "Не влияют на оценку".
- `src/lib/export-markdown.ts` — секция `## Продуктовые челленджи` в md-экспорте.
- `vitest.config.ts` + `npm test` / `npm run test:watch`.
- `docs/knowledge/direct-pro-knowledge-skeleton.md` — санитизированный скелетон 20 доменов Direct.Pro.
- `docs/knowledge/source-packs/README.md` — формат source-pack манифестов и порядок 10 батчей.
- `docs/knowledge/card-review-process.md` — переходы `draft → review_needed → approved → deprecated` и критерии каждого.
- `tools/direct-pro-knowledge/README.md` — правила локальных raw-источников и кандидаты на адаптеры (пока ни одного не реализовано).

**Результат**: Tasks 1-9 и 11 закрыты. Task 10 — в процессе: несколько packs уже промоутнуты в runtime как `review_needed`. Актуальный статус см. в `docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md` → "Implementation Status".

### Раунд 6: Manual PDF drop tooling + первый knowledge pack `campaign-types-v1`

Реализован первый source-pack adapter — manual PDF drop. Добавлены два committed-инструмента в `tools/direct-pro-knowledge/`:

- `extract_pdf_text.py` — PyMuPDF-based PDF→text extractor. Читает `knowledge/drafts/<pack-id>/inputs/` (gitignored, может содержать симлинки), пишет UTF-8 текст в `knowledge/drafts/<pack-id>/extracted/`.
- `validate-candidates.ts` — Zod-валидатор для `candidate-cards.json`. Парсит против `directProKnowledgeCardSchema`, проверяет уникальность id (внутри драфта и относительно уже промоутнутых runtime-карточек), запрещает `confidence: "approved"` для драфтов.

В `.gitignore` добавлены `/baza_znaniy/` (drop-folder для пользовательских PDF) и `/.venv-pdf/` (локальный venv с pymupdf). Обновлены: `docs/knowledge/source-packs/README.md`, `tools/direct-pro-knowledge/README.md`, план (Implementation Status + "How to resume Task 10").

На этом раунде был подготовлен первый домен-батч `campaign-types-v1`: 8 draft-карточек по основным типам кампаний Direct.Pro (`campaign_type.{epk, master_campaigns, simple_start, product_campaign, reach_campaign, thematic_promotion, content_promotion, context_banner}`). Драфты валидировались Zod-схемой и остались в gitignored `knowledge/drafts/campaign-types-v1/` как provenance. Источник — 9 PDF в `baza_znaniy/campaigns/`, текст извлечён в `knowledge/drafts/campaign-types-v1/extracted/`.

**Новые файлы:**

- `tools/direct-pro-knowledge/extract_pdf_text.py`
- `tools/direct-pro-knowledge/validate-candidates.ts`
- `docs/knowledge/source-packs/campaign-types-v1/source-pack.yaml`
- `docs/knowledge/source-packs/campaign-types-v1/notes.md`

**Состояние**: промоутнуто в runtime как `src/knowledge/direct-pro/cards/campaign-types.{json,ts}` и подключено в `cards/index.ts`.

### Раунд 7: Knowledge packs promoted to runtime

После human review были промоутнуты следующие packs:

- `campaign-types-v1` → `campaign-types.{json,ts}`: 8 cards.
- `campaign-hierarchy-lifecycle-v1` → `campaign-hierarchy.{json,ts}`: 13 cards.
- `campaign-group-settings-v1` → `campaign-group-settings.{json,ts}`: 16 cards.
- off-order `interface-surfaces-v1` → `interface-surfaces.{json,ts}`: 16 cards. Этот pack был сделан вне исходного 10-batch порядка, потому что пользователь отдельно загрузил сфокусированные PDF про интерфейсы.

### Раунд 8: Ad formats / ad elements pack

Пользователь добавил новую папку `baza_znaniy/banners/` с PDF про материалы и элементы объявлений. Для неё создан off-order source pack `ad-formats-elements-v1`:

- committed docs: `docs/knowledge/source-packs/ad-formats-elements-v1/source-pack.yaml` и `notes.md`;
- ignored drafts: `knowledge/drafts/ad-formats-elements-v1/{candidate-cards.json,coverage-note.md,conflicts.md,unresolved-questions.md}`;
- runtime: `src/knowledge/direct-pro/cards/ad-formats-elements.{json,ts}` — 25 cards;
- `Продвижение приложений-v1-5_17_202.pdf` классифицирован как app-promotion campaign/product-mode source, не как ad-materials source; его надо взять позже как top-up для campaign types или отдельный app-promotion pack.

Проверки на момент промоушена: `npx tsx tools/direct-pro-knowledge/validate-candidates.ts ad-formats-elements-v1` passed, `npx vitest run` passed (48/48), `npm run build` passed.

### Раунд 9: Formats / shows pack

Пользователь добавил новую папку `baza_znaniy/formats and shows/` с PDF про форматы, варианты выдачи, плейсменты и диагностику показов. Для неё создан off-order source pack `formats-shows-v1`:

- committed docs: `docs/knowledge/source-packs/formats-shows-v1/source-pack.yaml` и `notes.md`;
- ignored drafts: `knowledge/drafts/formats-shows-v1/{candidate-cards.json,coverage-note.md,conflicts.md,unresolved-questions.md}`;
- runtime: `src/knowledge/direct-pro/cards/formats-shows.{json,ts}` — 17 cards.

Пак покрывает search templates / варианты выдачи, динамические места, галерею услуг, РСЯ для блогеров, Playable Ads, наружную рекламу, промоакции, no-show diagnostics, low position, unexpected query/geo/rendering, минус-фразы, показы после остановки, запрещённые площадки и сходные объявления.

Проверки на момент промоушена: `npx tsx tools/direct-pro-knowledge/validate-candidates.ts formats-shows-v1` passed, `npx vitest run` passed (49/49), `npm run build` passed.

### Раунд 10: Targeting / semantics pack

Пользователь добавил новую папку `baza_znaniy/show-rules/` с PDF про условия показа, таргетинги и семантику подбора. Для неё создан source pack `targeting-semantics-v1`:

- committed docs: `docs/knowledge/source-packs/targeting-semantics-v1/source-pack.yaml` и `notes.md`;
- ignored drafts: `knowledge/drafts/targeting-semantics-v1/{candidate-cards.json,coverage-note.md,conflicts.md,unresolved-questions.md}`;
- runtime: `src/knowledge/direct-pro/cards/targeting-semantics.{json,ts}` — 18 cards.

Пак покрывает автотаргетинг, категории автотаргетинга, упоминания брендов, автоставку автотаргетинга, интересы и привычки, ключевые фразы, операторы, стоп-слова, минус-фразы, кросс-минусовку, библиотеку минус-фраз, семантическое соответствие, приоритизацию объявлений, сегменты аудитории, Search vs РСЯ логику сегментов, двойное отрицание, ограничения тематик и сохранение/обнуление CTR фраз.

### Что нужно проверить

- Прогнать 3 эталонных эпика (`epic1.md`, `epic2.md`, `epic3.md`) после деплоя Challenger.
- Сравнить оценки с предыдущими раундами (до Pre-Analysis и до Challenger).
- Убедиться, что N/A реально ставится через Pre-Analysis (а не 0-3).
- Проверить, что критерий "Решение" оценивает саммари, а не весь эпик.
- Проверить, что Challenger срабатывает на эпиках про campaign / ad group / ad и не падает на эпиках без триггерных слов.
- Глянуть, что секция "Продуктовые челленджи" в UI и в .md-экспорте выглядит читаемо и не выглядит как часть скора.

### Ключевые файлы

| Файл | Что содержит |
|------|-------------|
| `docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md` | **Главный план Challenger'а.** Implementation status, ответы на open questions, как продолжить Task 10. |
| `docs/knowledge/direct-pro-knowledge-skeleton.md` | Скелетон 20 доменов Direct.Pro (campaign types, hierarchy, settings, surfaces, targeting, moderation, billing, stats, legal, adjacent, ...). |
| `docs/knowledge/source-packs/README.md` | Манифесты source pack'ов, порядок 10 батчей. |
| `docs/knowledge/card-review-process.md` | Жизненный цикл карточек, критерии promotion и demotion. |
| `tools/direct-pro-knowledge/README.md` | Правила raw-источников, runbook манул-PDF-адаптера, end-to-end workflow для пака. |
| `tools/direct-pro-knowledge/extract_pdf_text.py` | PDF→text extractor (PyMuPDF). Запуск: `.venv-pdf/bin/python tools/direct-pro-knowledge/extract_pdf_text.py <pack-id>`. |
| `tools/direct-pro-knowledge/validate-candidates.ts` | Валидатор `candidate-cards.json` против Zod-схемы. Запуск: `npx tsx tools/direct-pro-knowledge/validate-candidates.ts <pack-id>`. |
| `src/lib/openai.ts` | `EVALUATION_MODEL = "gpt-5.5"` + клиент OpenAI + `isProductChallengerEnabled()` (default false). |
| `src/lib/types.ts` | CRITERIA, CRITERIA_GROUPS, PreAnalysisResult, **ProductChallenge**, scoreToStatus(), calculateTotalScore(). |
| `src/lib/evaluation-schema.ts` | Zod + JSON Schema для валидации ответов LLM по группам критериев. |
| `src/lib/pre-analysis-schema.ts` | Zod + JSON Schema для Pre-Analysis. |
| `src/lib/product-challenger-schema.ts` | Zod + OpenAI strict JSON Schema для Product Challenger. |
| `src/lib/export-markdown.ts` | Экспорт результата в .md (включая секцию челленджей). |
| `src/prompts/system-prompt.ts` | BASE_PROMPT, CRITERIA_DESCRIPTIONS, GROUP_EXAMPLES, `buildGroupPrompt(groupId, preAnalysis?, cards?)` — третий аргумент рендерит блок «КОНТЕКСТ ДИРЕКТ ПРО». |
| `src/prompts/pre-analysis-prompt.ts` | Промпт Pre-Analysis (Step 0). |
| `src/prompts/product-challenger-prompt.ts` | Промпт Product Challenger (Step 4). |
| `src/knowledge/direct-context.ts` | Карта продуктов Директа для Pre-Analysis. |
| `src/knowledge/direct-pro/schema.ts` | Schema одобренной карточки знания. |
| `src/knowledge/direct-pro/cards/{core,index}.ts` | Core seed cards and barrel export for all runtime knowledge cards. |
| `src/knowledge/direct-pro/cards/*.json` + `*.ts` wrappers | Promoted domain packs (`campaign-types`, `campaign-hierarchy`, `campaign-group-settings`, `interface-surfaces`, `ad-formats-elements`, `formats-shows`, `targeting-semantics`). |
| `src/knowledge/direct-pro/select.ts` | Селектор карточек по aliases. |
| `src/components/evaluation-result.tsx` | UI результата: карточки, бейджи, группы + секция "Продуктовые челленджи". |
| `src/app/api/evaluate/route.ts` | API endpoint: Pre-Analysis → `selectDirectProCards` → 3 параллельных group eval (с карточками) → force N/A → totalScore → опционально Product Challenger под флагом → JSON. |
| `vitest.config.ts` | Конфиг vitest с `@/*` алиасом. |

### Эталонные эпики для тестирования

- `epic1.md`, `epic2.md`, `epic3.md` — предоставлены как примеры хороших эпиков (ожидание: ~80+ баллов)

### История оценок

| Эпик | До изменений | После N/A | После рекалибровки |
|------|-------------|-----------|-------------------|
| epic1 | 56 | 61 | ? |
| epic2 | 46 | 48 | ? |
| epic3 | 36 | 39 | ? |

---

## Принятые решения

1. **Порог OK остаётся на 7** — вместо снижения порога мы облегчили получение высоких оценок через рекалибровку промпта
2. **Продуктовый фокус** — инструмент оценивает продуктовую полноту, а не техническую спецификацию
3. **Контекстный кредит** — LLM должен засчитывать информацию, которая очевидно следует из контекста эпика
4. **N/A — это не плохо описанное** — score = -1 только для реально неприменимых критериев, не для плохо раскрытых

## Возможные следующие шаги

### Локальные research/test файлы

В рабочей директории могут лежать untracked файлы вроде `epic*.md`, `epic-review-*.md`, `challenger-vs-evaluator.xlsx` и разовые debug/spec notes под `docs/superpowers/specs/`. Это локальные research/benchmark/test inputs пользователя для прогонов через агента. Их **не надо коммитить** и не надо считать частью текущей фичи, если пользователь явно не назвал конкретный файл и не попросил добавить его в git.

### Прямо сейчас на повестке (Task 10 из плана)

Заполнение знаниевых карточек по доменным батчам. Делается **итеративно**, по одному source pack за раз, с human review между батчами. Подробный how-to — в `docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md` (секция "How to resume Task 10 in a fresh session" — там варианты для drafted, already promoted и fresh pack).

**Текущий статус:** в runtime уже подключены packs `campaign-types-v1`, `campaign-hierarchy-lifecycle-v1`, `campaign-group-settings-v1`, off-order `interface-surfaces-v1`, off-order `ad-formats-elements-v1`, off-order `formats-shows-v1` и `targeting-semantics-v1`. Нет известного draft pack, который прямо сейчас ждёт промоушена.

Очередь батчей (порядок зафиксирован в `docs/knowledge/source-packs/README.md`):

1. `campaign-types-v1` — promoted (8 cards).
2. `campaign-hierarchy-lifecycle-v1` — promoted (13 cards).
3. `campaign-group-settings-v1` — promoted (16 cards).
4. `interface-surfaces-v1` — promoted off-order (16 cards).
5. `ad-formats-elements-v1` — promoted off-order (25 cards).
6. `formats-shows-v1` — promoted off-order (17 cards).
7. `targeting-semantics-v1` — promoted (18 cards).
8. `bulk-professional-surfaces-v1` — pending; grids, mass edit, Commander, Excel, API, mobile app, change history. Не путать с off-order `interface-surfaces-v1`.
9. moderation-focused pack — pending; do not duplicate ad formats/materials already covered by `ad-formats-elements-v1`.
10. `billing-agency-legal-entities-v1` — pending.
11. `reports-statistics-optimization-v1` — pending.
12. `legal-marking-compliance-v1` — pending.
13. `support-adjacent-services-v1` — pending.

Каждый батч ждёт от пользователя одобренный source pack (PDF / sanitized текст / approved Wiki выгрузка).

### Другое

- Прогнать 3 эталонных эпика после деплоя Challenger и сравнить со старыми оценками.
- Калибровка на ground truth от экспертов.
- Self-consistency (несколько прогонов, медиана score).
- Конституция команды (настраиваемый контекст).
- Интеграция в Tracker/Jira.
- Итеративный flow (оценил → доработал → оценил повторно).
