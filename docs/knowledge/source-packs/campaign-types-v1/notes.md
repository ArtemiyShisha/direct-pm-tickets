# Notes — campaign-types-v1

This source pack covers Direct.Pro **campaign types and product modes**. The goal is one card per concrete campaign/product mode and a tight summary of what makes it different from siblings — not a deep dive into each mode's settings, ad assets, or billing.

## What lives in the inputs

User-provided PDFs (in `/baza_znaniy/campaigns/`, gitignored) — internal Direct.Pro support knowledge pages, exported as PDF on 2026-05-09. Each PDF maps to a single campaign type or scenario:

| PDF | Expected card | Notes |
|---|---|---|
| `Единая перфоманс-кампания…` | `campaign_type.epk` | EPK / Unified Performance Campaign — the central expert-mode campaign in Direct.Pro |
| `Мастер кампаний…` | `campaign_type.master_campaigns` | Auto-mode wizard for SMB |
| `Простой старт…` | `campaign_type.simple_start` | Beginner-friendly mode with simplified setup and moderation |
| `Товарная кампания…` | `campaign_type.product_campaign` | Feed-driven product campaign |
| `Охватные кампании…` | `campaign_type.reach_campaign` | Reach (CPM/awareness) campaign |
| `Продвижение в тематических разделах` | `campaign_type.thematic_promotion` | Promotion inside Yandex thematic sections |
| `Продвижение контента…` | `campaign_type.content_promotion` | Content promotion (publisher-facing campaigns) |
| `Баннер на Поиске (Контекстный…)` | `campaign_type.context_banner` | Context Banner on Search |
| `Web+App…` | **NOT a campaign type** — it is an EPK setting/scenario; deferred to `campaign-group-settings-v1`. Mentioned here only as a relation on `campaign_type.epk` |

Archived/historical campaign types from the skeleton (`dynamic_ads`, `smart_banners`, `mobile_app_promotion`, `telegram_ads`, `dooh`) are **not in these inputs** and will be picked up in a later top-up batch (see `coverage-note.md`).

## How to read the extracted text

The internal pages mix product facts with support-only material:

- product-relevant: what the campaign type is, what differentiates it, which strategies/objectives it supports, which placements/surfaces, prerequisites, copy/migration behavior, what's archived, what's deprecated;
- **support-only** (skip for cards): phone scripts, chat templates, email templates, ticket queues, escalation paths, "если клиент отказался…" call flows, КПБ workflows, "На странице нет ответа" sections.

When in doubt, prefer leaving a fact out of the card and logging it in `unresolved-questions.md`.

## Authoring rules for this batch

- One card per campaign type. Do not create a single "campaign types overview" card.
- Aliases must be realistic words a PM would write in an epic — Russian first, with English fallbacks where the PDF uses an English term (e.g. `EPK`, `web+app`).
- Challenge rules are **questions or risk checks**, never product claims. They should fire when an epic touches this campaign type but ignores its peculiarities (archived status, restricted entry points, scenario-only sub-modes, feed dependency, separate strategy stack, etc.).
- `entityLevel` is `campaign` for every card.
- `appliesToCampaignTypes` is empty (the card *is* the campaign type — referencing itself adds noise).
- `surfaces` should reference how the campaign is created/edited where the PDF actually says so (e.g. expert mode, simple start interface, master wizard) — do not invent surface ids that don't appear elsewhere.
- `relatedCards` may reference other `campaign_type.*` cards from this batch and may forward-reference future cards (`setting.web_app_scenario`, `entity.feed`) — flag every forward-reference in `unresolved-questions.md`.
- `confidence` is `"review_needed"` until a product owner signs off.

## What this notes file is NOT

- Not a place to paste raw PDF text. Sanitized summaries only.
- Not a place to add facts from outside the campaign-types domain. Those go to `unresolved-questions.md` for the right future batch.
