# Epic Reviewer

Инструмент автоматической оценки эпиков и PRD для Яндекс Директа. Анализирует текст эпика по 14 критериям качества, задаёт вопросы по пробелам и предлагает черновики для доработки.

## Зачем это нужно

Менеджеры продукта пишут эпики, которые потом берутся в разработку. Проблема: качество описания сильно варьируется — где-то нет метрик, где-то нет сценариев, где-то нет плана запуска. Это приводит к:

- Потере времени на уточнения уже в процессе разработки
- Непредсказуемым результатам из-за непроработанных корнер-кейсов
- Переделкам из-за отсутствия критериев приёмки

Epic Reviewer проверяет эпик *до* того, как он попадёт в бэклог, и помогает его доработать.

## Что делает инструмент

1. PM вставляет текст эпика или загружает `.md` файл.
2. Система делает **Pre-Analysis** (определяет тип эпика, затронутые продукты, N/A-критерии).
3. Параллельно оценивает эпик по 14 критериям в 3 группах с учётом контекста из Pre-Analysis.
4. Для каждого критерия выдаёт:
   - **Анализ** — что нашла в тексте и чего не хватает (chain-of-thought).
   - **Оценку** — 0-10 баллов с обоснованием, или **N/A** если критерий неприменим к эпику.
   - **Вопросы к PM** — конкретные вопросы по пробелам.
   - **Черновик** — готовый текст для вставки в эпик (при score < 7).
5. Параллельно гоняет **Direct.Pro Product Challenger**: отдельный LLM-вызов, который задаёт продуктовые вопросы и поднимает риски к самой идее в контексте Direct.Pro (на основе одобренных карточек знания). Челленджи **не влияют на оценку** — они показываются отдельной секцией, чтобы PM мог увидеть продуктовые дыры даже когда формальные критерии зелёные.
6. Считает итоговый балл 0-100 с учётом весов применимых критериев (N/A-критерии исключаются).
7. Позволяет скачать результат в Markdown (включая блок "Продуктовые челленджи").

## Критерии оценки

14 критериев разбиты на 3 группы. Каждая группа оценивается отдельным вызовом LLM для более глубокого анализа.

### Бизнес-обоснование

| Критерий | Вес | Что оценивает |
|----------|-----|---------------|
| Проблема | x1.5 | Кто страдает и почему, контекст важнее точных цифр |
| Решение | x1.5 | Суть подхода к решению проблемы |
| Потенциал | x1.0 | Ожидаемый бизнес-эффект (может быть N/A для комплаенс-эпиков) |
| Метрики успеха | x1.5 | Перечень метрик, целевые значения — плюс |
| Аналитика | x1.0 | Обоснование данными (может быть N/A для регуляторных) |

### UX и сценарии

| Критерий | Вес | Что оценивает |
|----------|-----|---------------|
| Дизайн | x1.0 | Наличие макетов (ссылки на Figma, скриншоты, мокапы) |
| Сценарии | x1.5 | Шаги пользователя, состояния UI, реакция системы |
| Корнер-кейсы | x1.0 | Граничные случаи и поведение системы |
| Онбординг | x0.7 | Механики для новых и существующих пользователей (N/A если не нужно обучение) |

### Техническая готовность

| Критерий | Вес | Что оценивает |
|----------|-----|---------------|
| Интерфейсы | x0.7 | Какие клиенты затронуты (веб, моб, API, Excel) |
| Межнар | x0.7 | Страны и языки поддержки (N/A если не зависит от региона) |
| Ready For Dev | x1.5 | Продуктовая полнота описания для понимания ЧТО делать |
| Логирование | x0.7 | Список событий для логирования |
| Запуск | x1.0 | План раскатки, эксперимент, критерии приёмки |

### Система весов

Итоговый балл: `sum(score_i * weight_i) / sum(10 * weight_i) * 100` — считается только по применимым критериям (N/A исключаются из суммы).

Высокий вес (x1.5) у критериев, без которых разработка не может начаться: Проблема, Решение, Метрики, Сценарии, Ready For Dev. Стандартный вес (x1.0) у Дизайна, Потенциала, Аналитики, Корнер-кейсов, Запуска. Низкий вес (x0.7) у критериев, которые могут прорабатываться параллельно или зависят от контекста.

Часть критериев может быть неприменима (N/A): Потенциал, Аналитика, Дизайн, Онбординг, Межнар — в зависимости от типа эпика.

### Шкала оценки

| Баллы | Статус | Значение |
|-------|--------|----------|
| N/A (-1) | N/A | Критерий неприменим к данному эпику |
| 0-1 | FAIL | Полностью отсутствует |
| 2-3 | FAIL | Упомянуто без конкретики |
| 4-5 | PARTIAL | Попытка с существенными пробелами |
| 6 | PARTIAL | Базовый уровень, не хватает глубины |
| 7-8 | OK | Хорошо проработано |
| 9-10 | OK | Отлично, придраться не к чему |

## Архитектура

### Стек

- **Next.js 16** (App Router) — фронтенд + API routes
- **TypeScript** — сквозная типизация
- **Tailwind CSS 4 + shadcn/ui** — UI-компоненты
- **OpenAI `gpt-5.5`** — LLM со structured output (JSON Schema). Модель централизована через `EVALUATION_MODEL` в `src/lib/openai.ts`.
- **Zod 4** — валидация ответов LLM (импорт через `zod/v4`)
- **Vitest** — юнит-тесты (`npm test`)

### Пайплайн оценки (v3)

```
Текст эпика
    │
Step 0 ──→ GPT: Pre-Analysis (тип эпика, продукты, N/A-критерии)
    │
    ├──→ GPT: Бизнес-обоснование (5 критериев)  ─┐
    ├──→ GPT: UX и сценарии (4 критерия)         ─┤  параллельно (Steps 1-3)
    └──→ GPT: Тех. готовность (5 критериев)      ─┘
                                                   │
                                       Сервер: merge + forceNaCriteria + totalScore
                                                   │
Step 4 ──→ если selectDirectProCards(text) ≠ ∅ → GPT: Direct.Pro Product Challenger
            (до 12 челленджей, не пересчитывает score; ошибка ловится в try/catch)
                                                   │
                                       Результат: 14 критериев + total_score 0-100
                                                  + product_challenges (или [])
```

Каждый вызов GPT:
- Получает полный текст эпика + промпт, сфокусированный на своём шаге.
- Возвращает structured JSON по заданной JSON Schema.
- Для критериев выполняется chain-of-thought (analysis → score → questions → suggestion).
- Валидируется Zod-схемой на сервере.

Challenger дополнительно ограничен жёстким правилом "не выдумывать факты о Direct.Pro сверх переданных карточек знания". Если знаний не хватает, он формулирует вопрос как проверку допущения.

### Структура проекта

```
src/
├── app/
│   ├── api/evaluate/route.ts          # POST endpoint: Pre-Analysis → 3 group eval → forceNaCriteria → Challenger
│   ├── layout.tsx                     # Root layout
│   └── page.tsx                       # Главная страница (ввод + результаты)
├── components/
│   ├── epic-input.tsx                 # Textarea + drag-n-drop .md/.txt
│   ├── evaluation-result.tsx          # Раскрывающиеся карточки по группам + блок "Продуктовые челленджи"
│   ├── score-badge.tsx                # Круговой индикатор 0-100
│   └── ui/                            # shadcn/ui примитивы
├── lib/
│   ├── types.ts                       # Критерии, веса, группы, CriterionResult, EvaluationResult, ProductChallenge
│   ├── evaluation-schema.ts           # Zod + JSON Schema для каждой группы
│   ├── pre-analysis-schema.ts         # Zod + JSON Schema для Pre-Analysis (Step 0)
│   ├── product-challenger-schema.ts   # Zod + OpenAI strict JSON Schema для Challenger (Step 4)
│   ├── export-markdown.ts             # Экспорт результата в .md (включая Challenger)
│   ├── openai.ts                      # OpenAI client + EVALUATION_MODEL = "gpt-5.5"
│   └── utils.ts                       # cn() helper
├── prompts/
│   ├── system-prompt.ts               # buildGroupPrompt(groupId, preAnalysis?)
│   ├── pre-analysis-prompt.ts         # промпт Step 0
│   └── product-challenger-prompt.ts   # промпт Step 4
└── knowledge/
    ├── direct-context.ts              # Карта продуктов Директа для Pre-Analysis
    ├── epic-template.ts               # Шаблон-распознавалка boilerplate чек-листов
    └── direct-pro/
        ├── schema.ts                  # Schema одобренной карточки знания
        ├── select.ts                  # Селектор карточек по aliases
        └── cards/
            ├── index.ts               # barrel: DIRECT_PRO_KNOWLEDGE_CARDS
            └── core.ts                # entity.campaign / entity.ad_group / entity.ad (review_needed)

docs/
├── knowledge/
│   ├── direct-pro-knowledge-skeleton.md   # 20 доменов Direct.Pro (PDF skeleton)
│   ├── card-review-process.md             # Лайфцикл карточек: draft → review_needed → approved
│   └── source-packs/
│       └── README.md                      # Формат source-pack манифестов, порядок 10 батчей
└── superpowers/plans/
    └── 2026-05-09-direct-pro-knowledge-map.md   # Главный план Challenger'а + implementation status

tools/
└── direct-pro-knowledge/
    └── README.md                      # Правила локальных raw-источников и кандидаты адаптеров
```

### Ключевые модули

**`lib/types.ts`** — единый источник правды: массив `CRITERIA` (id, label, weight), `CRITERIA_GROUPS` (3 группы), интерфейсы `CriterionResult`, `EvaluationResult` и `ProductChallenge`, функции `scoreToStatus()` и `calculateTotalScore()`.

**`lib/evaluation-schema.ts`** — функции `buildGroupZodSchema()` и `buildGroupJsonSchema()` генерируют валидационные схемы для каждой группы критериев. `GROUP_SCHEMAS` — предсобранные схемы для всех 3 групп.

**`lib/openai.ts`** — singleton-клиент OpenAI + константа `EVALUATION_MODEL`. Все четыре LLM-вызова (Pre-Analysis, 3 группы, Challenger) используют одну модель — меняется в одном месте.

**`prompts/system-prompt.ts`** — `buildGroupPrompt(groupId, preAnalysis?)` собирает промпт из базовой части (правила, шкала, инструкция по формату) + список критериев группы + few-shot пример. Каждая группа имеет свой пример оценки.

**`prompts/product-challenger-prompt.ts`** — собирает промпт Challenger'а из `PreAnalysisResult` + summary критериев + выбранных карточек знания. В промпте явно зашит запрет на выдумывание фактов сверх карточек.

**`knowledge/direct-pro/select.ts`** — `selectDirectProCards(epicText)` детерминированно матчит aliases карточек к тексту (`toLocaleLowerCase("ru-RU")` + `String.includes`). Если возвращает `[]`, Challenger не зовётся.

**`app/api/evaluate/route.ts`** — `POST` handler: Pre-Analysis → 3 параллельных `evaluateGroup()` через `Promise.all` → `forceNaCriteria` → `calculateTotalScore` → `runProductChallenger` (best-effort, в try/catch). Возвращает `{ criteria, total_score, product_challenges }`.

### Knowledge map для Challenger'а

Карточки знания живут в `src/knowledge/direct-pro/cards/`. Их сейчас всего три (`entity.campaign`, `entity.ad_group`, `entity.ad`) с `confidence: "review_needed"`. Дальнейшее наполнение идёт по плану `docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md` (Task 10): по одному доменному source pack за раз, с human review между батчами.

Ключевая дисциплина:

- Raw Arcadia/Wiki-выгрузки и приватные пути остаются локально (см. `.gitignore`).
- В рантайм идут **только** одобренные карточки из `src/knowledge/direct-pro/cards/`.
- Каждая карточка декларирует `sourceRefs` без копии исходного текста — это позволяет трассировать факт без утечки источника.

Подробнее: `docs/knowledge/card-review-process.md` и `docs/knowledge/source-packs/README.md`.

## Локальная разработка

```bash
npm install
cp .env.local.example .env.local  # добавить OPENAI_API_KEY
npm run dev                        # http://localhost:3000
npm test                           # vitest run (юнит-тесты)
npm run build                      # next build (typecheck + production build)
```

## Деплой

Хостинг на Railway. Репозиторий подключён к Railway — автодеплой при пуше в `main`.

Переменные окружения на Railway:
- `OPENAI_API_KEY` — ключ API OpenAI

## Возможные улучшения

### На повестке прямо сейчас

- **Task 10 из плана Challenger'а:** заполнение карточек знания по 10 доменным батчам (campaign types → hierarchy → settings → surfaces → targeting → moderation → billing → stats → legal → adjacent). Каждый батч ждёт одобренный source pack. Полный how-to — в `docs/superpowers/plans/2026-05-09-direct-pro-knowledge-map.md` (секция "How to resume Task 10 in a fresh session").

### Дальше

- Калибровка на реальных эпиках (ground truth от экспертов).
- Self-consistency (несколько прогонов, медиана score).
- Конституция команды (настраиваемый контекст: какие критерии ослабить, специфика процессов).
- Интеграция в Tracker/Jira (бот, автоматическая проверка).
- Итеративный flow (оценил → доработал → оценил повторно → прогресс).
- История оценок и аналитика по команде.
