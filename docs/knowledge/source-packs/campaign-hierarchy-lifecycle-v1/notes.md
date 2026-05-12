# Notes — campaign-hierarchy-lifecycle-v1

This pack covers Direct.Pro **campaign / ad-group / ad lifecycle and actions**: иерархия аккаунт → кампания → группа объявлений → объявление, статусы каждого уровня и действия (старт/остановка/архивация/удаление/копирование/отправка на модерацию). Не повторяем типы кампаний (`campaign-types-v1`), детальные настройки (`campaign-group-settings-v1`) и массовые поверхности (`bulk-professional-surfaces-v1`).

## What lives in the inputs

User-provided PDFs (in `/baza_znaniy/interface/`, gitignored) — internal Direct.Pro support knowledge pages, exported as PDF on 2026-05-12:

| PDF | Expected card cluster | Notes |
|---|---|---|
| `Действия с кампаниями-v1-5_12_2026, .pdf` | `entity.campaign` (deep) + `state.campaign_status` + `action.campaign_*` | Старт/стоп/архив/удаление/копирование/отправка на модерацию на уровне кампании |
| `Действия с группами объявлени.pdf` | `entity.ad_group` (deep) + `state.ad_group_status` + `action.group_*` | Действия с группой: остановка, копирование, удаление, перенос |
| `Действия с объявлениями-v1-5_12_20.pdf` | `entity.ad` (deep) + `state.ad_status` + `action.ad_*` | Действия с объявлением: старт/стоп, архивация, копирование, отправка на модерацию |

`entity.account` карточку в этом паке тоже стоит завести (пусть и кратко) — потому что многие действия и статусы определяются на уровне аккаунта (приостановка по балансу, права доступа), а из core.ts она отсутствует.

## How to read the extracted text

The internal pages mix product facts with support-only material:

- product-relevant: какие действия и статусы доступны на каждом уровне, какие правила перехода между статусами, какие необратимые действия (архивация ≠ удаление), какие действия имеют последствия на других уровнях (архивация кампании → что с группами и объявлениями), как ведут себя отдельные типы кампаний (МК / ЕПК / Простой старт) при действиях (часто ссылки в `relatedCards`);
- **support-only** (skip for cards): телефонные скрипты, шаблоны чатов и писем, очереди тикетов, эскалации, "если клиент отказался…", КПБ workflows.

When in doubt, prefer leaving a fact out of the card and logging it in `unresolved-questions.md`.

## Authoring rules for this batch

- One card per concept. Не сливать «все действия» в одну широкую карточку. По одной карточке на каждое действие (старт, стоп, архив, удаление, копирование, отправка на модерацию) и одну на статус-машину.
- `kind` — `entity` для иерархии, `state` для статус-карточек, `action` для действий.
- `entityLevel` — соответствующий уровень (`account` / `campaign` / `ad_group` / `ad`).
- `appliesToCampaignTypes` — заполнять только если PDF реально называет тип кампании, в котором действие отличается (например, «Архивация в МК недоступна»). Если действие универсально — оставлять пустым.
- `aliases` — реальные слова PM на русском: «архивация кампании», «остановка показов», «возобновить кампанию», «копировать кампанию», «отправить на модерацию», «удалить группу», «перенести объявление в другую группу» и т.д.
- `surfaces` — где задаётся действие: `surface.campaign_edit`, `surface.campaign_grid`, `surface.group_edit`, `surface.ad_edit`, `surface.expert_mode` и т.п. Не выдумывать новых.
- `relatedCards` — может ссылаться на `campaign-types-v1` карточки (`campaign_type.epk`, `campaign_type.master_campaigns` и т.д.), на core-сущности (`entity.campaign` пока существует в `core.ts`, но при промоушне будет заменена), на `setting.*` и forward-references на будущие батчи (`integration.moderation`, `tool.api`).
- `challengeRules` — это **вопросы и риск-чеки**, а не утверждения. Они должны срабатывать, когда эпик касается жизненного цикла, но игнорирует особенности: необратимость удаления, поведение при копировании (что копируется, что нет), различие архив vs остановка, поведение при отсутствии денег, права доступа.
- `confidence` — `"review_needed"` до подтверждения PM.

## Promotion impact (heads-up for promote step)

При промоушне этого пака:

- Карточки `entity.campaign / entity.ad_group / entity.ad` в `src/knowledge/direct-pro/cards/core.ts` будут **сняты** (placeholder-версии с минимальными aliases / challenge rules).
- Расширенные версии тех же id переедут в `src/knowledge/direct-pro/cards/campaign-hierarchy.ts`.
- Это нужно, чтобы валидатор и тест уникальности id (см. `src/knowledge/direct-pro/cards/index.test.ts`) остались зелёными.
- `core.ts` после очистки оставит другие core-карточки (если будут) или будет удалён и убран из `index.ts`.

## What this notes file is NOT

- Not a place to paste raw PDF text. Sanitized summaries only.
- Not a place to add facts из других доменов (типы кампаний, настройки, модерация, биллинг).
