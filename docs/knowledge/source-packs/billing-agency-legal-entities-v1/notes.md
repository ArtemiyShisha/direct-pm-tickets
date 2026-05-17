# Notes — billing-agency-legal-entities-v1

This source pack covers Direct.Pro **money operations, billing, payers, balances, refunds, VAT, and payment failures** from the focused folder `baza_znaniy/money/`.

It corresponds to the planned `billing-agency-legal-entities-v1` batch. Keep the pack focused on facts that change how an epic about money flows should be evaluated: who pays, where money is stored, when funds are credited or returned, what tax/payment constraints exist, and which edge cases must be specified for PM-ready behavior.

## What lives in the inputs

User-provided PDFs (in `/baza_znaniy/money/`, gitignored) — internal Direct.Pro support knowledge pages, exported as PDF on 2026-05-17:

| PDF | Expected card cluster | Notes |
|---|---|---|
| `Автоплатёж-v1-5_17_2026, 3_51_19 PM.pdf` | `setting.autopayment` | Automatic refill/payment behavior and failure handling. |
| `Баланс для пользователей Дире.pdf` | `concept.direct_balance` | User-facing balance and spend visibility. |
| `Возврат-v1-5_17_2026, 3_48_12 PM.pdf` | `process.refund` | Refund request, eligibility, timing, and payer constraints. |
| `Выставление счёта и оплата-v1-5_.pdf` | `process.invoice_payment` | Invoice creation and payment for resident/self-service flows. |
| `Выставление счета, оплата от н.pdf` | `process.nonresident_payment` | Non-resident invoice/payment constraints. |
| `Зачисление-v1-5_17_2026, 3_48_26 PM.pdf` | `process.funds_crediting` | Crediting logic, delays, and reconciliation. |
| `Зачисление_ инструкция для пе.pdf` | `process.funds_crediting` | Specialized crediting instructions; do not copy operator-only scripts into runtime. |
| `Зачисление_ инструкция для те.pdf` | `process.funds_crediting` | Specialized crediting instructions; draft only PM-visible rules. |
| `Куда пропали деньги-v1-5_17_2026, 3_50.pdf` | `failure.missing_funds` | Diagnostics when money is not visible or appears spent. |
| `Мошеннические списания-v1-5_17_202.pdf` | `failure.fraudulent_charge` | Suspicious or unauthorized charge handling. |
| `НДС_ ставки в разных странах, о.pdf` | `legal.vat` | VAT rates, country/legal entity implications, and document expectations. |
| `Общий счет-v1-5_17_2026, 3_51_01 PM.pdf` | `concept.shared_account` | Shared account model and campaign funding interactions. |
| `Овердрафт_ отсрочка платежа и .pdf` | `concept.overdraft` | Deferred payment/credit limit behavior. |
| `Ошибки оплаты_ не могу оплатит.pdf` | `failure.payment_error` | Payment failure diagnostics and next actions. |
| `Перенос денег-v1-5_17_2026, 3_49_20 PM.pdf` | `process.money_transfer` | Money transfer between accounts/campaigns/payers. |
| `Перенос денег-v1-5_17_2026, 3_49_42 PM.pdf` | `process.money_transfer` | Duplicate export; use only for cross-checking, not duplicate cards. |
| `Плательщик-v1-5_17_2026, 3_51_46 PM.pdf` | `role.payer` | Payer identity, payer changes, and legal entity constraints. |
| `Пожертвования в Директе-v1-5_17_20.pdf` | `process.donations` | Donation-specific payment flow, if PM-visible. |
| `Промокод-v1-5_17_2026, 3_50_02 PM.pdf` | `concept.promocode` | Promo code activation and balance implications. |
| `Работа в Балансе для оператор.pdf` | `tool.balance_operator` | Operator-facing Balance actions; only draft cards when behavior affects product requirements. |
| `Что отвечать про оплату PayPal-v1-5.pdf` | `process.paypal_payment` | PayPal support/payment caveats. |
| `Электронный чек-v1-5_17_2026, 3_53_34 PM.pdf` | `legal.electronic_receipt` | Electronic receipt requirements and customer-visible expectations. |

## Authoring rules for this batch

- **One narrow card per money behavior.** Split payer, invoice payment, crediting, refund, transfer, shared account, VAT, receipts, promo code, and payment failures when they trigger different PM questions.
- **Prefer PM-visible rules.** Operator-only Balance scripts, support wording, and internal troubleshooting steps should stay out of runtime unless they imply a user-visible state, SLA, permission, or edge case.
- **Use `process` for money flows.** Invoice/payment, crediting, refunds, transfers, donations, and PayPal flows should usually be `process` cards.
- **Use `concept` for money models.** Balance, shared account, overdraft, and promo code mechanics should usually be `concept` cards.
- **Use `role` for payer constraints** and `legal` for VAT/electronic receipt obligations.
- **Use `failure` for diagnostics.** Payment errors, missing funds, suspicious charges, and failed auto-payments should ask for states, user messaging, reconciliation, retries, and support escalation.
- **Aliases must be PM-like Russian terms first.** Examples: `оплата`, `счёт`, `баланс`, `зачисление`, `возврат`, `перенос денег`, `плательщик`, `общий счёт`, `НДС`, `электронный чек`, `промокод`, `овердрафт`, `автоплатёж`, `ошибка оплаты`, `пропали деньги`.
- **Challenge rules are checks, not claims.** Ask whether the epic covers payer/legal entity constraints, asynchronous crediting/refunds, tax documents, shared account interactions, retries, idempotency, and support-visible failure states.
- **`confidence`** is `"review_needed"` until a product owner signs off.

## What this notes file is NOT

- Not a place to paste raw PDF text. Sanitized summaries only.
- Not a second reports/statistics pack.
- Not a legal marking / ORD / sanctions pack.
- Not a support-script dump from Balance.
