# Notes — formats-shows-v1

This source pack covers Direct.Pro **ad formats, show/serving variants, placements, and showing diagnostics** from the focused folder `baza_znaniy/formats and shows/`.

It is an off-order pack because the user explicitly provided a focused source folder. The pack may touch topics that are normally split across ad formats, settings, targeting, and support diagnostics; keep each card narrow and log cross-domain facts instead of broadening the card.

## What lives in the inputs

User-provided PDFs (in `/baza_znaniy/formats and shows/`, gitignored) — internal Direct.Pro support knowledge pages, exported as PDF on 2026-05-17:

| PDF | Expected card cluster | Notes |
|---|---|---|
| `Playable Ads-v1-5_17_2026, 2_46_56 PM.pdf` | `format.playable_ads` | Interactive playable creative format. |
| `Варианты выдачи-v1-5_17_2026, 2_45_31 PM.pdf` | `placement.show_variant`, search/show placements | Placement and output variants for ads. |
| `Галерея услуг-v1-5_17_2026, 2_48_30 PM.pdf` | `placement.service_gallery` | Service gallery placement / format cluster. |
| `Динамические места на Поискеβ.pdf` | `placement.dynamic_search_places` | Beta dynamic search placements. |
| `Жалоба на чужие или сходные об.pdf` | support-only / conflict candidate | Use only if it creates a product-facing card; otherwise log as out of scope. |
| `Запрещенные площадки-v1-5_17_2026, 2.pdf` | `setting.blocked_placements` top-up | Existing setting card exists; draft only if this source adds showing-specific risk not already covered. |
| `Идут показы по минус-словам_фр.pdf` | `failure.negative_keyword_shows` | Showing diagnostics related to negative keywords/phrases. |
| `Наружная реклама β-v1-5_17_2026, 2_49_0.pdf` | `format.outdoor_advertising` / `placement.dooh` | Outdoor / DOOH beta format and placement behavior. |
| `Нет показов по расширенному г.pdf` | `failure.extended_geo_no_shows` | Showing diagnostics for extended geo. |
| `Нет показов-v1-5_17_2026, 2_24_35 PM.pdf` | `failure.no_shows` | General no-impressions diagnostics. |
| `Объявление не показывается на.pdf` | `failure.ad_not_showing_expected_surface` | Diagnostics for missing on a specific surface. |
| `Объявление показывается не в .pdf` | `failure.unexpected_surface_shows` | Diagnostics for ads shown in an unexpected place. |
| `Показы по геотаргетингу не из .pdf` | `failure.geo_targeting_unexpected_shows` | Showing diagnostics for geo targeting. |
| `Показы по запросу, которого не.pdf` | `failure.unexpected_query_shows` | Diagnostics for query mismatch / query not in keywords. |
| `Показы по остановленным объяв.pdf` | `failure.paused_ad_shows` | Diagnostics for impressions after pause/stop. |
| `Промоакции-v1-5_17_2026, 2_48_47 PM.pdf` | `element.promotion` / `format.promo` | Promotion ad element or format cluster, depending on source. |
| `РСЯ для блогеров-v1-5_17_2026, 2_48_20 PM.pdf` | `placement.blogger_network` | YAN/blogger placement cluster. |

## Authoring rules for this batch

- **One narrow card per product behavior.** Split formats, placements, and diagnostics when they trigger different PM questions.
- **Avoid duplicating existing cards.** If the source repeats `setting.blocked_placements`, `setting.geo_targeting`, ad elements, or campaign types, either add an unresolved question/top-up note or create only a narrow showing-specific failure card.
- **Use `failure` for diagnostics.** Pages about "нет показов", unexpected query/geography/surface, or paused ads should usually become `failure` cards with challenge rules that ask whether the epic covers diagnostics, explanations, timing, and user-visible states.
- **Use `placement` for where ads can be served.** Pages about output variants, service gallery, dynamic search places, blogger network, or DOOH placement surfaces should usually become `placement` cards.
- **Use `format` for concrete creative/show formats.** Playable Ads and outdoor advertising can be `format` when the source describes a concrete format; use `placement` if the useful fact is mainly where it appears.
- **Aliases must be PM-like Russian terms first.** Examples: `варианты выдачи`, `места показа`, `нет показов`, `объявление не показывается`, `показы по минус-словам`, `геотаргетинг`, `остановленное объявление`, `промоакции`, `галерея услуг`, `наружная реклама`, `playable ads`.
- **Challenge rules are checks, not claims.** Ask whether the epic covers availability by campaign type/surface, diagnostics for no-shows, delayed state propagation, explanation text, and interactions with targeting/settings.
- **`confidence`** is `"review_needed"` until a product owner signs off.

## What this notes file is NOT

- Not a place to paste raw PDF text. Sanitized summaries only.
- Not a full targeting-semantics pack.
- Not a moderation workflow pack.
- Not a reports/statistics pack.
