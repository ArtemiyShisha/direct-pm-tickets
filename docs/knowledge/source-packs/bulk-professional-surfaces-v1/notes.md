# Bulk Professional Surfaces Source Pack

## Scope

This pack covers Direct / Direct.Pro tools and professional surfaces that PMs mention as separate user-facing capabilities:

- API, Excel import/export, Commander, mobile app, and campaign change history;
- planning and analysis tools such as Wordstat, budget forecast, report library, promotion results overview, and Yandex Audiences;
- asset/data tools such as feeds, landings, offline conversions, and conversion center;
- AI-assisted tools and adjacent product surfaces when the source describes their Direct-visible behavior;
- safety or access friction for tool usage, such as captcha, only at the product-behavior level.

## Card Authoring Rules

- Keep cards narrow: one tool, surface, integration, or diagnostic limitation per card.
- Prefer `kind: "tool"` for user-facing instruments and `kind: "integration"` for external data/API connections.
- Use `entityLevel: "account"` for account-wide tools, `entityLevel: "campaign"` for campaign-scoped tools, and omit or use `"unknown"` when the source does not settle the object level.
- Reference existing cards where helpful: `surface.direct_pro_interface`, `tool.change_history`, `report.report_wizard`, `report.report_library_assistant`, `integration.metrica_goals_for_optimization`, `setting.target_actions`, `setting.audience_segments`, `concept.audience_segments_search_vs_network`, and `tool.feed_management`.
- Challenge rules should ask PMs to specify tool availability, import/export semantics, permission boundaries, bulk-edit effects, background processing, error states, and consistency with Direct.Pro UI.

## Out Of Scope

- Detailed creative editing, ad material generation, preview, and moderation: covered by `ad-formats-elements-v1` or a future moderation-focused pack.
- Deep statistics discrepancy interpretation, optimization strategy learning, and fraud investigations: covered by `reports-statistics-optimization-v1`.
- Account representative roles, agency login issuance, transfer to agency, and blocked-access support trees: covered by `account-access-settings-v1`.
- Report Library and report AI assistant basics: already covered by `reports-statistics-optimization-v1`; this pack only references them from Overview/Audit cards.
- Broad Yandex advertising neurotechnology positioning notes: not promoted unless a source describes a stable Direct-visible tool contract.
- Yandex Benefit / browser-extension support routing: adjacent product, not a Direct.Pro runtime knowledge card for this pack.
- Billing, refunds, payer constraints, legal documents, and VAT.
- Raw support templates, internal queue names, tickets, customer examples, or private operational snippets.

## Safety Notes

Do not copy source text verbatim into runtime cards. Summaries must be sanitized and self-contained. For API, captcha, AI, and conversion/import tools, keep challenge rules at the product contract level and avoid operational bypass details, internal anti-fraud logic, private endpoints, or source-specific troubleshooting scripts.
