# Notes — interface-surfaces-v1

This pack covers **client-facing surfaces of the Direct / Direct.Pro family** plus the cross-cutting concepts that frame those surfaces: разница между Direct и Direct.Pro, режимы (Эксперт, Мастер кампаний, Простой старт), интерфейс клиента и интерфейс агентства, инструменты в левой колонке, Рекомендации (как самостоятельный домен — отдельный набор фич, лимитов, политик), регистрация и онбординг новых клиентов, кабинет вендора в Direct.Pro для совместного продвижения. Не перезаписываем типы кампаний (`campaign-types-v1`), действия (`campaign-hierarchy-lifecycle-v1`), настройки (`campaign-group-settings-v1`).

## What lives in the inputs

User-provided PDFs (in `/baza_znaniy/interface/`, gitignored) — internal Direct.Pro support knowledge pages, exported as PDF on 2026-05-12:

| PDF | Expected card cluster | Notes |
|---|---|---|
| `Интерфейсы Директ и Директ Пр.pdf` | `concept.direct_vs_direct_pro` + `surface.client_interface` + `surface.expert_mode` + `surface.master_campaigns_wizard` + `surface.simple_start_wizard` | The "spine" of this pack. Описывает разделение Direct (клиентский) и Direct.Pro (расширенный). |
| `Интерфейс Директа для клиента.pdf` | `surface.client_interface` (deeper) + `tool.left_menu` + `concept.search_in_direct` | Клиентский интерфейс в деталях: левое меню, поиск, кампании, Мастер отчётов, История изменений, Дополнительная информация, бизнес-аккаунт. |
| `Регистрация в Директе-v1-5_12_2026, .pdf` | `process.registration_onboarding` + `surface.simple_start_wizard` | Процесс регистрации: страны, типы клиентов (РФ/КЗ/БЛ/Узбекистан/прочее), быстрая регистрация без сайта, переключение страны. |
| `Рекомендации-v1-5_12_2026, 3_23_20 PM.pdf` | `surface.recommendations` + `concept.recommendation_engine` | Раздел Рекомендаций — отдельный продуктовый домен (не путать с `setting.auto_apply_recommendations`); типы рекомендаций, группировка, история, история применения. |
| `Инструменты и ошибки в интерф.pdf` | `tool.left_menu` (deeper) + `tool.changes_history` + `failure.interface_glitches` | «Инструменты» из левой колонки + типичные ошибки в интерфейсе (загрузка, переключение страны, ошибки сохранения и т.д.) |
| `Директ Про для вендоров-v1-5_12_202.pdf` | `surface.vendor_office` + `concept.vendor_copromotion_direct_pro` | Кабинет вендора в Direct.Pro для совместного продвижения; отдельная роль/UI. Не дублирует `setting.vendor_copromotion` из `campaign-group-settings-v1`. |

## Authoring rules for this batch

- **Surfaces, не features.** Карточки должны описывать поверхности (где живёт функциональность) и концепты, а не отдельные фичи. Например, `surface.client_interface` — это про устройство клиентского веб-интерфейса в целом, не про конкретные кнопки.
- **Не дублировать settings/actions/types.** Если факт уже покрыт в `campaign-types-v1`, `campaign-group-settings-v1` или `campaign-hierarchy-lifecycle-v1` — оставить там и сослаться через `relatedCards`. Например, действия с кампаниями уже покрыты в `action.campaign_*` — здесь только описание UI-локации этих действий.
- **`kind` соответствие:**
  - `surface` — UI-поверхности (client interface, expert mode, MK/SS wizard, recommendations panel, vendor office).
  - `concept` — кросс-режущие понятия (Direct vs Direct.Pro, recommendation engine, vendor copromotion как концепт).
  - `process` — пользовательские процессы (регистрация, онбординг).
  - `tool` — инструменты левого меню (changes history, search, etc.).
  - `failure` — типичные ошибки интерфейса.
- **`aliases` — реальные слова PM на русском:** «интерфейс Директа», «Direct.Pro», «Direct Pro», «режим эксперта», «Мастер кампаний», «Простой старт», «вендор», «совместное продвижение», «рекомендации», «история изменений», «инструменты», «регистрация в Директе» и т.д.
- **`surfaces` поле**: для surface-карточек оно может оставаться пустым (карточка сама — поверхность). Для concept/process/tool/failure — указывать те поверхности, где они проявляются.
- **`challengeRules` — это вопросы и риск-чеки**, не утверждения. Например: «Эпик трогает интерфейс Direct.Pro, но не упоминает клиентский Direct — нужно описать оба».
- **`confidence`** — `"review_needed"` до подтверждения PM.

## Promotion impact (heads-up for promote step)

При промоушне этого пака:

- Несколько карточек, на которые ссылались `campaign-types-v1` и `campaign-hierarchy-lifecycle-v1` (`surface.client_interface`, `surface.expert_mode`, `surface.master_campaigns_wizard`, `surface.simple_start_wizard`, `surface.direct_pro_interface`, `surface.recommendations`, `surface.vendor_office`), наконец появятся в runtime — это закрывает forward-ref'ы.
- `setting.vendor_copromotion` из `campaign-group-settings-v1` остаётся как настройка ЕПК; новый `surface.vendor_office` — это **кабинет** вендора (отдельная роль и UI), они должны cross-linked через `relatedCards`.
- `setting.auto_apply_recommendations` остаётся как сама настройка; `surface.recommendations` — про панель рекомендаций как домен.

## What this notes file is NOT

- Not a place to paste raw PDF text. Sanitized summaries only.
- Not a place to add детали отдельных рекомендаций — только описание домена и его поведения.
- Not a place to добавить факты из других доменов (типы кампаний, настройки, модерация, биллинг).
