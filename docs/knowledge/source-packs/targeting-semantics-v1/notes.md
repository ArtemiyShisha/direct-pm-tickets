# Notes — targeting-semantics-v1

This source pack covers Direct.Pro **targeting semantics and show-rule mechanics** from the focused folder `baza_znaniy/show-rules/`.

It corresponds to the planned `targeting-semantics-v1` batch. The sources overlap with existing settings and show-diagnostic cards, so keep this pack focused on semantic behavior: how Direct decides whether a show is eligible, which targeting condition matched, how exclusions apply, and which state transitions preserve or reset targeting-derived data.

## What lives in the inputs

User-provided PDFs (in `/baza_znaniy/show-rules/`, gitignored) — internal Direct.Pro support knowledge pages, exported as PDF on 2026-05-17:

| PDF | Expected card cluster | Notes |
|---|---|---|
| `Автотаргетинг-v1-5_17_2026, 3_12_30 PM.pdf` | `setting.autotargeting` top-up / targeting concepts | Existing broad setting card exists; draft only narrower behavior that is not already covered. |
| `Интересы и привычки-v1-5_17_2026, 3_12.pdf` | `setting.interests_habits` | Audience targeting by inferred interests and habits. |
| `Ключевые фразы, операторы, сто.pdf` | `setting.keywords` / `concept.keyword_operators` | Keyword matching, operators, stop words, and phrase semantics. |
| `Минус-слова, минус-фразы, стоп-.pdf` | `setting.negative_phrases` / `concept.negative_keyword_operators` | Negative phrase levels and matching rules; avoid duplicating `failure.negative_phrase_shows`. |
| `Настройка «Приоритизация объ.pdf` | `setting.object_prioritization` | Prioritization of promoted objects or selection logic. |
| `Показы взрослой, медицинской, .pdf` | `concept.restricted_topic_show_rules` | Adult, medical, and other sensitive-topic show restrictions. |
| `Правила сохранения и обнулени.pdf` | `concept.targeting_state_preservation` | Which targeting-related values persist or reset across edits/copying/restarts. |
| `Сегменты аудитории (ретаргети.pdf` | `setting.audience_segments` / `setting.retargeting` | Retargeting and audience segment conditions. |
| `Семантическое соответствие-v1-.pdf` | `concept.semantic_matching` | Semantic matching as a source of query/show eligibility. |

## Authoring rules for this batch

- **One narrow card per targeting behavior.** Split keywords, negative phrases, audience segments, semantic matching, interests, autotargeting, and restricted-topic rules when they trigger different PM questions.
- **Avoid duplicating existing cards.** Existing runtime cards already cover `setting.autotargeting`, `setting.geo_targeting`, `failure.unexpected_query_shows`, `failure.negative_phrase_shows`, and broad no-show diagnostics. Use related card links and only draft top-ups when the source adds new semantics.
- **Use `setting` for user-configurable targeting.** Keywords, negative phrases, interests/habits, audience segments, retargeting, and object prioritization should usually be `setting` cards.
- **Use `concept` for matching mechanics.** Operators, semantic matching, restricted-topic restrictions, preservation/reset rules, and source-of-show logic should usually be `concept` cards.
- **Use `failure` only for diagnostics not already covered.** Do not re-create show failures from `formats-shows-v1` unless this source adds a distinct targeting-specific failure mode.
- **Aliases must be PM-like Russian terms first.** Examples: `автотаргетинг`, `ключевые фразы`, `операторы`, `минус-фразы`, `ретаргетинг`, `сегменты аудиторий`, `интересы и привычки`, `семантическое соответствие`, `стоп-слова`, `взрослая тематика`, `медицинская тематика`.
- **Challenge rules are checks, not claims.** Ask whether the epic covers level of application, activation delay, matching source, operator edge cases, interaction with autotargeting/semantic matching, and sensitive-topic restrictions.
- **`confidence`** is `"review_needed"` until a product owner signs off.

## What this notes file is NOT

- Not a place to paste raw PDF text. Sanitized summaries only.
- Not a second campaign/group settings pack.
- Not a replacement for `formats-shows-v1` diagnostics.
- Not a moderation workflow pack.
