# Account Access Settings Source Pack

## Scope

This pack covers account-level access and administration behavior in Direct / Direct.Pro:

- user account constraints and access state;
- representatives and role boundaries;
- agency interface and agency login issuance;
- transferring a client account into an agency;
- blocked access to the interface;
- PIN-code identification in support-sensitive account flows.

## Card Authoring Rules

- Keep cards narrow: one access role, account state, or agency process per card.
- Prefer account-level `entityLevel: "account"` unless the fact is clearly about a role or support process.
- Use `surface.agency_interface` only for agency-specific UI/admin surfaces; do not restate the full Direct.Pro menu inventory from `interface-surfaces-v1`.
- Reference existing cards where helpful: `entity.account`, `surface.direct_pro_interface`, `surface.client_interface`, `concept.direct_vs_direct_pro`, `failure.interface_glitches`, `role.payer`, and `concept.shared_account`.
- Challenge rules should ask PMs to distinguish direct clients, agency clients, representatives, administrators, and support-only recovery flows.

## Out Of Scope

- Payment, invoices, refunds, transfers of money, overdraft, payer and tax/document rules: covered by `billing-agency-legal-entities-v1`.
- Campaign/group/ad settings and lifecycle: covered by campaign packs.
- General Direct vs Direct.Pro feature inventory and left-menu availability: covered by `interface-surfaces-v1`.
- Raw support templates, internal queue names, tickets, customer examples, or private operational snippets.

## Safety Notes

Do not copy source text verbatim into runtime cards. Summaries must be sanitized and self-contained. PIN-code and blocked-access facts should be phrased as product/support risk checks, not as detailed internal authentication instructions.
