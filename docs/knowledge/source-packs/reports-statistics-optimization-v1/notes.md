# Notes — reports-statistics-optimization-v1

This source pack covers Direct.Pro **reports, statistics discrepancies, Metrica integration questions, fraud/invalid-click diagnostics, traffic forecasts, experiments, and post-launch optimization** from the focused folder `baza_znaniy/stats/`.

It corresponds to the planned `reports-statistics-optimization-v1` batch. Keep the pack focused on facts that change how an epic about analytics, reports, optimization, or suspicious statistics should be evaluated: which report surface is involved, what metric/source discrepancy is expected, what diagnostics are needed, which asynchronous corrections or investigations exist, and how PMs should specify edge cases for post-launch decisions.

## What lives in the inputs

User-provided PDFs (in `/baza_znaniy/stats/`, gitignored) — internal Direct.Pro support knowledge pages, exported as PDF on 2026-05-17:

| PDF | Expected card cluster | Notes |
|---|---|---|
| `Вопросы по Метрике-v1-5_17_2026, 4_32_1.pdf` | `integration.metrica_questions` | Metrica counters/goals/session data and user questions about metrics. |
| `Всплески показов и кликов-v1-5_17.pdf` | `failure.impressions_clicks_spike` | Diagnostics for sudden impression/click growth. |
| `Для прогноза трафика не хвата.pdf` | `report.traffic_forecast_limits` | Why traffic forecast is unavailable or incomplete. |
| `Жалоба на фрод кликов (склик)_ .pdf` | `failure.click_fraud_complaint` | Click-fraud complaints and invalid-click checks. |
| `Жалоба на фрод кликов_ инструк.pdf` | `process.click_fraud_investigation` | Support/process detail for click-fraud investigation; draft only PM-visible states. |
| `Жалоба на фрод конверсий (стра.pdf` | `failure.conversion_fraud_complaint` | Conversion-fraud complaints and suspicious conversion diagnostics. |
| `Жалоба на фрод конверсий_ инст.pdf` | `process.conversion_fraud_investigation` | Support/process detail for conversion-fraud investigation; draft only PM-visible states. |
| `Запрос на корректировку или к.pdf` | `process.statistics_adjustment_request` | Requests to adjust or correct statistics. |
| `Конкурентный анализ-v1-5_17_2026, 4_3.pdf` | `report.competitive_analysis` | Competitive analysis/reporting expectations. |
| `Новый Мастер отчётов-v1-5_17_2026, 4_.pdf` | `report.report_wizard` | New Report Wizard behavior and dimensions/metrics. |
| `Оптимизация кампании — для те.pdf` | `process.campaign_optimization` | Optimization after campaign launch and diagnostic actions. |
| `Отчёты Директа и Метрики, разн.pdf` | `concept.direct_metrica_discrepancy` | Direct vs Metrica report discrepancy rules. |
| `Повышение эффективности — дл.pdf` | `process.performance_improvement` | Efficiency improvement after launch. |
| `Спад показов-v1-5_17_2026, 4_30_53 PM.pdf` | `failure.impressions_drop` | Diagnostics for impression drops. |
| `Эксперименты (А_Б-тесты)-v1-5_17_202.pdf` | `process.ab_experiments` | A/B experiments and testing workflow. |

## Authoring rules for this batch

- **One narrow card per analytics behavior.** Split report surfaces, Direct-vs-Metrica discrepancies, forecast limits, fraud complaints, adjustment requests, experiments, and optimization flows when they trigger different PM questions.
- **Prefer PM-visible rules.** Operator-only investigation scripts, support wording, and internal queue mechanics should stay out of runtime unless they imply a visible state, SLA, permission, correction, or user-facing edge case.
- **Use `report` for reporting surfaces and report families.** Report Wizard, competitive analysis, traffic forecast, and report discrepancy concepts should be `report` or `concept` depending on whether the card describes a surface or a model.
- **Use `integration` for Metrica coupling.** Metrica counters, goals, attribution, and cross-product data differences should ask for source-of-truth, latency, permissions, and mismatch handling.
- **Use `failure` for diagnostics.** Spikes, drops, click fraud, conversion fraud, and missing forecast data should ask for states, thresholds, explanations, and escalation paths.
- **Use `process` for investigations and optimization workflows.** Adjustment requests, experiments, campaign optimization, and efficiency improvement should ask for eligibility, lifecycle, and post-launch measurement.
- **Aliases must be PM-like Russian terms first.** Examples: `отчёты`, `статистика`, `Мастер отчётов`, `Метрика`, `расхождение статистики`, `склик`, `фрод кликов`, `фрод конверсий`, `корректировка статистики`, `прогноз трафика`, `спад показов`, `всплеск кликов`, `эксперимент`, `А/Б-тест`, `оптимизация кампании`.
- **Challenge rules are checks, not claims.** Ask whether the epic covers data source, attribution window, reporting lag, corrections, investigation outcomes, user messaging, and how success is measured after launch.
- **`confidence`** is `"review_needed"` until a product owner signs off.

## What this notes file is NOT

- Not a place to paste raw PDF text. Sanitized summaries only.
- Not a second billing, targeting, or campaign-settings pack.
- Not a dump of support investigation scripts.
