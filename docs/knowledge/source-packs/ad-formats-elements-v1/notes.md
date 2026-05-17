# Notes — ad-formats-elements-v1

This pack covers Direct.Pro **ad formats, ad materials, and ad elements**: text, site links and displayed domain, images, video, graphical ads, carousel, organization card, Turbo pages, personalization, template-based elements, and combinatorial EPK ads.

It intentionally does **not** cover moderation as a process. If source pages mention moderation, use it only as a lightweight risk in a challenge rule when it is directly tied to the material or element; do not create moderation-status cards in this batch.

## What lives in the inputs

User-provided PDFs (in `/baza_znaniy/banners/`, gitignored) — internal Direct.Pro support knowledge pages, exported as PDF on 2026-05-17:

| PDF | Expected card cluster | Notes |
|---|---|---|
| `Текст в объявлении_ текст, заг.pdf` | `element.ad_text`, `element.ad_title` | Text fields, titles, and description constraints. |
| `Ссылка на сайт_ отображаемый д.pdf` | `element.site_link`, `element.display_domain` | Landing URL and displayed domain behavior. |
| `Изображения-v1-5_17_2026, 2_01_12 PM.pdf` | `asset.image` | Image assets in ads. |
| `Видео в объявлениях-v1-5_17_2026, 2_00.pdf` | `asset.video` | Video assets in ads. |
| `Графические объявления-v1-5_17_202.pdf` | `format.graphic_ad` | Graphical ad format. |
| `Карусель-v1-5_17_2026, 2_01_35 PM.pdf` | `element.carousel` | Carousel as an ad element / material cluster. |
| `Карточка организации-v1-5_17_2026, 2.pdf` | `element.organization_card` | Organization card shown inside ad materials. |
| `Турбо-страницы-v1-5_17_2026, 2_04_43 PM.pdf` | `asset.turbo_page` | Turbo page as a destination / creative-linked asset. |
| `Персонализация объявлений-v1-5_.pdf` | `concept.ad_personalization` | Dynamic/personalized ad content behavior. |
| `Элементы объявления_ шаблоны, .pdf` | `element.ad_template`, shared ad elements | Template-based elements and reusable ad material structure. |
| `Комбинаторное объявление в Ед.pdf` | `format.combinatorial_epk_ad` | Combinatorial ad format inside EPK. |
| `Продвижение приложений-v1-5_17_202.pdf` | to verify during extraction | If it is a campaign/product mode, log it as out-of-scope for a campaign-types top-up instead of forcing it into this pack. |

## Authoring rules for this batch

- **Formats, assets, elements.** Use `format` for concrete ad formats, `asset` for uploaded or generated creative/destination materials, `element` for fields or blocks inside an ad, and `concept` only for cross-cutting behavior like personalization.
- **One narrow card per reusable concept.** Split title/text/link/image/video when their behavior differs. Do not make one broad "ad materials" card.
- **Aliases must be PM-like Russian terms first.** Examples: `текст объявления`, `заголовок`, `отображаемый домен`, `картинка`, `изображение`, `видео`, `графическое объявление`, `карусель`, `карточка организации`, `турбо-страница`, `персонализация`, `комбинаторное объявление`.
- **Keep campaign-type facts out.** If a PDF turns out to describe a campaign mode rather than ad material behavior, put it in `unresolved-questions.md` or `coverage-note.md` as a top-up candidate for `campaign-types-v1`.
- **Challenge rules are checks, not claims.** They should ask whether the epic covers limits, fallback behavior, preview, bulk editing, copying, and dependencies on campaign type or surface when those details matter.
- **`entityLevel` is usually `ad` or `asset`.** Use `ad` for fields/elements that live on the ad object; use `asset` for creative or destination assets; use `unknown` only when the source does not settle ownership.
- **`confidence`** is `"review_needed"` until a product owner signs off.

## Promotion impact

When promoted, this pack should make the group evaluators ask sharper Direct.Pro-aware questions for epics that mention ad text, links, images, video, graphical ads, carousels, organization cards, Turbo pages, personalization, templates, and combinatorial EPK ads.

## What this notes file is NOT

- Not a place to paste raw PDF text. Sanitized summaries only.
- Not a moderation pack.
- Not a campaign-type top-up pack.
- Not a replacement for interface, settings, lifecycle, legal, billing, or statistics domains.
