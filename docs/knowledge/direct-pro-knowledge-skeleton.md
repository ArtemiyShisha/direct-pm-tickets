# Direct.Pro Knowledge Skeleton

> Sanitized skeleton extracted from user-provided PDF index: `/Users/artemshishkin/Downloads/База знаний по Директу для под.pdf`.
> User-provided PDFs or text files may be committed when explicitly approved. Raw Arcadia/Wiki dumps and local filesystem paths to private source trees must not be committed.

## Purpose

This skeleton is the navigation layer for the future Direct.Pro knowledge map. It does not try to encode product truth yet. It answers a narrower question: which knowledge domains should the Product Challenger know how to retrieve and reason over?

The final knowledge map should use this skeleton to organize fact cards about:

- product entities and settings;
- where settings live in Direct.Pro;
- which campaign types, roles, surfaces, states, and integrations are affected;
- which contradictions or questions should be raised when an epic touches those areas.

## Top-Level Domains

### 1. Support Operations And Escalation

Use this domain only for support-process context, not for core product facts.

- chat, mail, and phone regulations;
- reopen handling;
- bug and critical situation flows;
- support templates and editorial policy;
- Chinese client support;
- quality checks;
- escalation to content owners when no template exists.

### 2. Campaign Types

This domain should become a catalog of campaign/product modes and their differences.

- Simple Start;
- Campaign Wizard / Master of Campaigns;
- business promotion without a site or through a landing;
- marketplace sales campaigns;
- mobile app promotion;
- promotion in Yandex Maps;
- Telegram channel promotion;
- product campaign;
- Expert Mode / Direct.Pro;
- Unified Performance Campaign (EPK);
- Telegram ads through EPK;
- ads in Telegram channels;
- MAX ads;
- reach campaigns;
- outdoor / DOOH campaigns;
- context banner on Search;
- thematic section promotion;
- content promotion;
- archived campaign types: dynamic ads, smart banners, mobile ads;
- Web + App campaigns;
- in-app event transfer.

Expected future cards:

- `campaign_type.epk`
- `campaign_type.master_campaigns`
- `campaign_type.simple_start`
- `campaign_type.telegram_ads`
- `campaign_type.mobile_app_promotion`
- `campaign_type.dooh`
- `campaign_type.context_banner`
- `campaign_type.dynamic_ads`
- `campaign_type.smart_banners`

### 3. Campaign Settings

This is one of the central domains for the Challenger. It should describe settings, their canonical object level, availability, surfaces, defaults, and conflicts.

- automatic recommendation application;
- time targeting;
- geotargeting and advanced geotargeting;
- start and end dates;
- blocked IPs;
- blocked placements;
- geo tree changes;
- bid adjustments;
- vendor and retailer joint promotion;
- site monitoring;
- call tracking;
- URL parameters and UTM tags;
- Metrica counter and `yclid`;
- conversion goals / target actions;
- notifications.

Expected future cards:

- `setting.time_targeting`
- `setting.geo_targeting`
- `setting.bid_adjustments`
- `setting.blocked_ips`
- `setting.blocked_placements`
- `setting.url_parameters`
- `setting.metrica_counter`
- `setting.target_actions`
- `setting.recommendation_auto_apply`

### 4. Strategies And Auction

This domain should model strategy entities, optimization behavior, budgets, bids, and auction-related explanations.

- strategies;
- automatic strategies and conversion payment;
- maximum clicks with manual bids;
- optimization behavior and whether it can be disabled;
- average daily budget;
- attribution models in strategies;
- auction, traffic volume, bid forecast, charged price;
- setting and changing bids;
- price wizard and unified price;
- differences between budget forecast and recommended bids;
- increased bid / click price explanations;
- click price higher than bid.

Expected future cards:

- `setting.strategy`
- `setting.auto_strategy`
- `setting.manual_bids`
- `setting.average_daily_budget`
- `concept.attribution_model`
- `concept.auction`
- `surface.price_wizard`

### 5. Interface And Product Surfaces

This domain describes where product behavior appears in the Direct.Pro interface and adjacent tools.

- Direct interface;
- client interface;
- Direct vs Direct.Pro interfaces;
- Direct.Pro for vendors;
- recommendations;
- UI tools and errors;
- filters, statistics, conversion goals, and interface settings.

Expected future cards:

- `surface.direct_pro_interface`
- `surface.client_interface`
- `surface.recommendations`
- `surface.filters`
- `surface.statistics_view`
- `surface.conversion_goals_view`

### 6. Campaign Actions

This domain is central for checking product ideas involving campaign lifecycle or campaign-level operations.

- campaign statuses;
- activation timing;
- finish activation;
- campaign visibility problems;
- send campaign to moderation;
- start and stop campaign;
- archive campaign;
- delete campaign;
- save campaign errors;
- log information requests;
- copy campaign within one login or between logins.

Expected future cards:

- `entity.campaign`
- `state.campaign_status`
- `action.campaign_send_to_moderation`
- `action.campaign_start_stop`
- `action.campaign_archive`
- `action.campaign_delete`
- `action.campaign_copy`
- `failure.campaign_save_error`
- `surface.logs_request`

### 7. Ad Group Actions

This domain should model group-level actions and is especially important for settings that live on groups.

- group to keyword matching;
- group labels;
- add group;
- enable or stop group;
- copy group;
- archive group;
- delete group;
- bulk group changes;
- restore group or group settings;
- group save errors.

Expected future cards:

- `entity.ad_group`
- `action.ad_group_add`
- `action.ad_group_start_stop`
- `action.ad_group_copy`
- `action.ad_group_archive`
- `action.ad_group_delete`
- `action.ad_group_bulk_edit`
- `failure.ad_group_save_error`

### 8. Ad Actions

This domain should model ad-level actions, navigation, and bulk behavior.

- navigation by groups and ads inside a campaign;
- add ad;
- enable or stop ad;
- copy ad;
- archive ad;
- delete ad;
- bulk ad changes;
- ad save errors.

Expected future cards:

- `entity.ad`
- `action.ad_add`
- `action.ad_start_stop`
- `action.ad_copy`
- `action.ad_archive`
- `action.ad_delete`
- `action.ad_bulk_edit`
- `failure.ad_save_error`

### 9. Group And Ad Assets

This domain describes creative and ad material components. It should help challenge ideas that add or change ad fields.

- video and video extensions;
- organization card, phone, contacts;
- graphical ads;
- images and smart centers;
- ad personalization;
- carousel;
- combinatorial ad;
- ad button;
- neuro ads;
- ad preview;
- site link, quick links, display domain, redirects, counters;
- ad text, title, second title;
- turbo sites and pages;
- callouts;
- price in ad;
- templates.

Expected future cards:

- `asset.video`
- `asset.organization_card`
- `asset.image`
- `asset.carousel`
- `asset.combinatorial_ad`
- `asset.ad_button`
- `surface.ad_preview`
- `asset.site_link`
- `asset.quick_links`
- `asset.display_domain`
- `asset.ad_text`
- `asset.callouts`
- `asset.price_in_ad`
- `asset.template`

### 10. Serving, Formats, And Placements

This domain helps challenge ideas that affect delivery, visibility, placements, and formats.

- no impressions / no delivery;
- no impressions by advanced geotargeting;
- ad not shown at a position;
- ad shown in unexpected appearance;
- impressions when they should not happen;
- impressions by missing, deleted, or disabled keywords or autotargeting;
- impressions by negative keywords or phrases;
- impressions on blocked placements;
- impressions for stopped ads and campaigns;
- impressions outside time targeting;
- impressions outside campaign geo;
- complaints about other or similar ads;
- search result layouts;
- Search traffic stencils;
- Network formats;
- Playable Ads;
- Yandex Images, product search, Maps blocks;
- Search experiments;
- placements;
- dynamic Search placements;
- product gallery;
- service gallery;
- ad elements: favicon, title, highlighting, callouts, contact info, display link, warnings, disclaimers, promotions, Market rating, official organization marks, advertiser section.

Expected future cards:

- `concept.no_impressions`
- `concept.unexpected_impressions`
- `concept.search_layout`
- `placement.search`
- `placement.networks`
- `placement.maps`
- `placement.product_gallery`
- `format.playable_ads`
- `element.favicon`
- `element.disclaimer`
- `element.advertiser_section`

### 11. Targeting And Semantics

This domain should capture targeting entities and their relation to groups, ads, and campaign types.

- autotargeting;
- interests and habits;
- keywords, operators, stop words;
- negative words and negative phrases;
- cross-negative matching;
- negative phrase library;
- audience segments;
- retargeting and audience selection rules;
- display conditions;
- semantic selection;
- adult, medical, and tragic topic serving;
- CTR preservation and reset for phrases;
- matching precision and ad prioritization;
- semantic matching and synonyms.

Expected future cards:

- `setting.autotargeting`
- `targeting.interests_and_habits`
- `targeting.keyword`
- `targeting.negative_keyword`
- `targeting.negative_phrase`
- `targeting.audience_segment`
- `targeting.retargeting`
- `targeting.display_condition`
- `concept.semantic_matching`
- `concept.keyword_ctr_reset`

### 12. Billing And Balance

This domain is needed when an epic touches money, payer, contract, countries, legal entities, or agency relations.

- invoice and payment;
- refund;
- payment allocation;
- payment errors;
- money transfer between logins, services, and agency sublogins;
- promo code;
- Balance interface for Direct users;
- Balance operator workflows;
- missing money and write-offs;
- shared account;
- shared account deficit;
- autopayment;
- overdraft;
- payer types and payer lifecycle;
- donations in Direct;
- non-resident invoicing and payment;
- VAT;
- PayPal;
- electronic receipts.

Expected future cards:

- `integration.balance`
- `entity.payer`
- `entity.shared_account`
- `concept.vat`
- `action.invoice`
- `action.refund`
- `action.money_transfer`
- `setting.autopayment`
- `setting.overdraft`
- `entity.promo_code`

### 13. Statistics, Reports, And Optimization

This domain is needed for metrics, post-launch checks, reports, and analytics contradictions.

- click fraud;
- conversion fraud;
- correction or compensation requests;
- spikes and drops in impressions/clicks/spend;
- insufficient traffic forecast statistics;
- experiments and recommendations;
- campaign effectiveness improvement;
- reports;
- differences between Direct reports, campaign page, and Metrica;
- invalid clicks and statistic corrections;
- Metrica questions;
- Search Queries report;
- Competitive Analysis report;
- Metrica goals loading;
- new Report Wizard;
- revenue and conversion value.

Expected future cards:

- `report.search_queries`
- `report.competitive_analysis`
- `report.report_wizard`
- `integration.metrica`
- `concept.invalid_clicks`
- `concept.statistics_discrepancy`
- `concept.conversion_value`
- `process.campaign_optimization`

### 14. Moderation

This domain is needed when an epic affects ad materials, documents, statuses, reasons, checks, or compliance.

- ad moderation rules;
- ad checks and moderation;
- remoderation;
- moderation in Simple Start;
- Modadvert checks;
- Direct interface checks for advertising information materials;
- moderation cases;
- account blocking;
- complaint about an ad;
- moderation questions and document submission.

Expected future cards:

- `integration.moderation`
- `process.ad_moderation`
- `process.remoderation`
- `surface.modadvert`
- `state.moderation_status`
- `failure.moderation_error`
- `process.ad_complaint`

### 15. Account, Access, Agencies, And Representatives

This domain is central for role-based challenges.

- Direct user account;
- account currency;
- user settings;
- delete account or login;
- registration country selection problems;
- geobase and region numbers;
- agency interface;
- agency login;
- account transfer to agency;
- representatives;
- full access;
- read-only access;
- client representatives;
- agency representatives and agency subclients;
- managing account / MCC;
- access errors and blocked interface;
- no campaign creation rights;
- PIN code problems;
- 403 access denied;
- login/password recovery;
- suspected account compromise.

Expected future cards:

- `role.direct_client`
- `role.agency`
- `role.agency_subclient`
- `role.representative_full`
- `role.representative_readonly`
- `role.mcc`
- `entity.account`
- `entity.login`
- `setting.account_currency`
- `concept.geobase`
- `failure.access_denied`

### 16. Tools

This domain captures adjacent tools and professional workflow surfaces.

- Audiences;
- API;
- report library;
- Wordstat;
- campaign change history;
- Direct mobile app;
- Yandex Neuro Ads;
- AI assistant;
- AI creative editor;
- targeting/ad lookup on SERP;
- feeds;
- Conversion Center and offline conversions;
- Excel;
- browser extension for promos/cashback;
- CAPTCHA in Direct and Wordstat;
- Commander;
- Direct landing pages;
- promotion results overview;
- budget forecast.

Expected future cards:

- `tool.api`
- `tool.excel`
- `tool.commander`
- `tool.wordstat`
- `tool.change_history`
- `tool.mobile_app`
- `tool.feeds`
- `tool.conversion_center`
- `tool.budget_forecast`
- `tool.ai_assistant`
- `tool.ai_creative_editor`

### 17. New Client And Onboarding

This domain helps challenge first-run and support-assisted flows.

- new client general information;
- ticket scenarios for new clients;
- campaign refinement;
- phone consultation for new clients.

Expected future cards:

- `process.new_client_onboarding`
- `process.new_client_ticket`
- `process.campaign_refinement`

### 18. Legal, Marking, Contracts, And Restrictions

This domain captures law-driven behavior and should be used carefully in Challenger output.

- advertising marking;
- law on advertising marking;
- ERIR;
- data transfer process for Direct placements;
- Yandex ORD;
- Yandex ORD API;
- tokens and creatives;
- payer marking;
- 3% internet advertising fee;
- contracts and closing documents;
- agency contract;
- offer;
- acts and reconciliation;
- postpaid contract for government organizations;
- grants and social logins;
- Yandex legal entity and sanctions;
- EU and Switzerland sanctions;
- personal data law;
- Direct behavior during mobile internet restrictions;
- Russian language protection law;
- VPN access restrictions.

Expected future cards:

- `legal.ad_marking`
- `legal.erir`
- `integration.ord`
- `entity.token`
- `entity.creative`
- `legal.contract`
- `legal.offer`
- `legal.closing_documents`
- `legal.sanctions`
- `legal.personal_data`

### 19. Client Development, Promotions, Events

Use this domain for marketing/support context, not for core product mechanics unless an epic touches promotions, loyalty, or partner flows.

- cashback and promo campaigns;
- archived Direct promotions;
- client education;
- conferences;
- customer cases;
- client wishes;
- client mailings;
- loyalty program;
- partner office;
- agency certification;
- specialist certification;
- private Direct setup specialists;
- education platforms.

Expected future cards:

- `process.client_wishes`
- `entity.promo_campaign`
- `entity.loyalty_program`
- `surface.partner_office`
- `process.agency_certification`

### 20. Adjacent Services

This domain helps identify when an epic actually belongs outside Direct.Pro or crosses service boundaries.

- Yandex Business;
- Business advertising subscription;
- Business landing;
- Business counter;
- Market banners and other Yandex services;
- Direct promotions from Yandex KIT;
- Yandex Vzglyad;
- questions about Market, Search, Webmaster, GO, ID, Plus, Alice, and other services.

Expected future cards:

- `adjacent.yandex_business`
- `adjacent.advertising_subscription`
- `adjacent.market`
- `adjacent.search`
- `adjacent.webmaster`
- `adjacent.yandex_id`

## Cross-Cutting Dimensions

Every approved knowledge card should be able to reference these dimensions when relevant:

- entity level: account, campaign, ad group, ad, asset, strategy, payer;
- campaign type applicability;
- role applicability;
- interface/surface applicability;
- state behavior;
- bulk behavior;
- copy behavior;
- import/export behavior;
- API/Commander/Excel consistency;
- moderation behavior;
- billing/legal behavior;
- rollout and feature-flag behavior;
- analytics/logging/reporting behavior.

## What This Skeleton Does Not Contain Yet

This skeleton does not claim facts such as:

- where exactly a setting lives;
- which campaign types support a setting;
- whether API, Commander, or Excel supports a feature;
- what the default value is;
- how old and new campaigns differ;
- what behavior support sees in logs.

Those facts must come later from specific source pages, approved notes, or expert review.
