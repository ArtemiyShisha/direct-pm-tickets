import type { CriterionId } from "@/lib/types";

// ---------- Interfaces ----------

export const INTERFACE_TYPES = [
  "web_desktop",
  "web_touch",
  "mobile_app",
  "api",
  "commander",
  "excel",
] as const;

export type InterfaceType = (typeof INTERFACE_TYPES)[number];

export const INTERFACE_LABELS: Record<InterfaceType, string> = {
  web_desktop: "Веб-интерфейс (десктоп)",
  web_touch: "Веб-интерфейс (тач/мобильная версия)",
  mobile_app: "Мобильное приложение Директа",
  api: "API v5",
  commander: "Директ Коммандер",
  excel: "Импорт/экспорт XLS/XLSX",
};

// ---------- Roles ----------

export const DIRECT_ROLES = [
  { id: "direct_client", name: "Прямой клиент (самоходный)" },
  { id: "agency", name: "Агентство" },
  { id: "agency_client", name: "Клиент агентства (субклиент)" },
  { id: "representative_full", name: "Представитель с полным доступом" },
  { id: "representative_readonly", name: "Представитель (только чтение)" },
  { id: "mcc_admin", name: "Управляющий аккаунт (администрирование)" },
  { id: "mcc_edit", name: "Управляющий аккаунт (редактирование)" },
  { id: "mcc_readonly", name: "Управляющий аккаунт (чтение)" },
  { id: "social_client", name: "Социальный клиент" },
  { id: "internal_ads", name: "Внутренняя реклама" },
  { id: "superuser", name: "Суперпользователь" },
  { id: "superviewer", name: "Суперсмотритель" },
  { id: "support", name: "Саппорт" },
  { id: "manager", name: "Менеджер" },
] as const;

// ---------- Integrations ----------

export const DIRECT_INTEGRATIONS = [
  { id: "bk", name: "БК (Баннерная Крутилка)", description: "Показ рекламы, фичефлаги, режимы раскатки" },
  { id: "moderation", name: "Модерация", description: "Проверка объявлений, доменов, контактов" },
  { id: "balance", name: "Баланс", description: "Оплата, юрлица, страны плательщиков" },
  { id: "metrika", name: "Яндекс Метрика", description: "Аналитика сайта, цели, конверсии, ретаргетинг" },
  { id: "audience", name: "Яндекс Аудитории", description: "Сегменты аудиторий, DMP" },
  { id: "business", name: "Яндекс Бизнес", description: "Карточки организаций" },
  { id: "crypta", name: "Крипта", description: "Поведенческий таргетинг, характеристики пользователей" },
] as const;

// ---------- Placements ----------

export const DIRECT_PLACEMENTS = [
  { id: "search", name: "Поиск Яндекса" },
  { id: "rsya", name: "РСЯ (Рекламная сеть Яндекса)" },
  { id: "maps", name: "Яндекс Карты" },
  { id: "product_gallery", name: "Товарная галерея" },
  { id: "telegram_channels", name: "Телеграм-каналы партнёров РСЯ" },
  { id: "dooh", name: "Наружная реклама (DOOH)" },
] as const;

// ---------- Countries & Languages ----------

export const DIRECT_COUNTRIES = ["RU", "BY", "KZ", "UZ", "TR"] as const;
export const DIRECT_LANGUAGES = ["ru", "en", "tr"] as const;

// ---------- Products ----------

export interface DirectProduct {
  id: string;
  name: string;
  description: string;
  interfaces: InterfaceType[];
  markets: string[];
  languages: string[];
  roles: string[];
  placements: string[];
  keywords: string[];
}

export const DIRECT_PRODUCTS: DirectProduct[] = [
  // --- Режимы интерфейса ---
  {
    id: "direct_lite",
    name: "Директ (простой)",
    description:
      "Базовый интерфейс для предпринимателей. Доступны Простой старт и Мастер кампаний. Нет API, Коммандера, Excel, Мастера отчётов, грида групп/объявлений.",
    interfaces: ["web_desktop", "web_touch", "mobile_app"],
    markets: ["RU"],
    languages: ["ru"],
    roles: ["direct_client"],
    placements: ["search", "rsya", "maps"],
    keywords: [
      "простой директ", "директ лайт", "direct lite", "direct_lite",
      "для предпринимателей", "упрощённый", "простой кабинет",
      "product_mode", "ff_direct_lite",
    ],
  },
  {
    id: "direct_pro",
    name: "Директ Про",
    description:
      "Расширенный интерфейс для профессиональных маркетологов. Все типы кампаний, API, Коммандер, Excel, Мастер отчётов, полный грид.",
    interfaces: ["web_desktop", "web_touch", "mobile_app", "api", "commander", "excel"],
    markets: ["RU", "BY", "KZ", "UZ", "TR"],
    languages: ["ru", "en", "tr"],
    roles: [
      "direct_client", "agency", "agency_client", "representative_full",
      "representative_readonly", "mcc_admin", "mcc_edit", "mcc_readonly",
      "social_client", "internal_ads", "superuser", "superviewer",
      "support", "manager",
    ],
    placements: ["search", "rsya", "maps", "product_gallery", "telegram_channels", "dooh"],
    keywords: [
      "директ про", "direct pro", "профессиональный", "профкабинет",
      "расширенный интерфейс",
    ],
  },

  // --- Инструменты создания кампаний ---
  {
    id: "epk",
    name: "Единая перфоманс-кампания (ЕПК)",
    description:
      "Основной профессиональный инструмент. Поиск + РСЯ + Карты + Товарная галерея + Телеграм в одной кампании. Гибкие настройки, все типы объявлений.",
    interfaces: ["web_desktop", "web_touch", "api", "commander", "excel"],
    markets: ["RU", "BY", "KZ", "UZ", "TR"],
    languages: ["ru", "en", "tr"],
    roles: [
      "direct_client", "agency", "agency_client", "representative_full",
      "social_client", "internal_ads",
    ],
    placements: ["search", "rsya", "maps", "product_gallery", "telegram_channels"],
    keywords: [
      "ЕПК", "единая перфоманс", "unified performance", "перфоманс-кампания",
      "текстово-графическое", "товарное объявление", "комбинаторное",
    ],
  },
  {
    id: "master_campaigns",
    name: "Мастер кампаний",
    description:
      "Упрощённое создание кампаний. Автогенерация объявлений, подбор аудитории. Доступен и в Директ, и в Директ Про, и в мобильном приложении.",
    interfaces: ["web_desktop", "web_touch", "mobile_app"],
    markets: ["RU", "BY", "KZ", "UZ", "TR"],
    languages: ["ru", "en", "tr"],
    roles: ["direct_client", "agency", "agency_client"],
    placements: ["search", "rsya", "maps"],
    keywords: [
      "мастер кампаний", "campaign master", "простой способ",
      "конверсии и трафик", "товарная кампания",
    ],
  },
  {
    id: "simple_start",
    name: "Простой старт",
    description:
      "Полностью автоматический запуск кампании. Достаточно указать ссылку на сайт. Доступен в Директ и Директ Про. Ограничен РФ, BY, KZ.",
    interfaces: ["web_desktop", "web_touch", "mobile_app"],
    markets: ["RU", "BY", "KZ"],
    languages: ["ru"],
    roles: ["direct_client"],
    placements: ["search", "rsya", "maps"],
    keywords: [
      "простой старт", "simple start", "автоматический запуск",
      "products-automatic",
    ],
  },
  {
    id: "telegram_ads",
    name: "Реклама в Телеграме",
    description:
      "Размещение в телеграм-каналах партнёров РСЯ. Настраивается через ЕПК. Два формата: автоподбор каналов (клики) и каталог каналов (просмотры). Нет отдельного API — управляется через API ЕПК.",
    interfaces: ["web_desktop", "web_touch"],
    markets: ["RU", "BY", "UZ", "KZ", "TR"],
    languages: ["ru"],
    roles: ["direct_client", "agency", "agency_client"],
    placements: ["telegram_channels"],
    keywords: [
      "телеграм", "telegram", "telegram ads", "телеграм-канал",
      "реклама в телеграме", "TELEGRAM",
    ],
  },
  {
    id: "media_ads",
    name: "Медийная реклама",
    description:
      "Охватные кампании для брендинга. Баннеры, видео. Только Директ Про.",
    interfaces: ["web_desktop", "web_touch", "api", "commander"],
    markets: ["RU", "BY", "KZ", "UZ", "TR"],
    languages: ["ru", "en", "tr"],
    roles: ["direct_client", "agency", "agency_client"],
    placements: ["rsya"],
    keywords: [
      "медийная", "медийка", "охватная", "брендинг", "CPM",
      "cpm_breed", "branding",
    ],
  },
  {
    id: "app_promotion",
    name: "Продвижение приложений",
    description:
      "Кампании для продвижения мобильных приложений iOS и Android. Только Директ Про.",
    interfaces: ["web_desktop", "web_touch", "api"],
    markets: ["RU", "BY", "KZ", "UZ", "TR"],
    languages: ["ru", "en", "tr"],
    roles: ["direct_client", "agency", "agency_client"],
    placements: ["search", "rsya"],
    keywords: [
      "приложение", "app promotion", "mobile app", "iOS", "Android",
      "CPI", "установки приложения",
    ],
  },
  {
    id: "org_promotion",
    name: "Продвижение организаций",
    description:
      "Продвижение карточки организации в Яндекс Картах и поиске. Доступно через Простой старт, Мастер кампаний и ЕПК.",
    interfaces: ["web_desktop", "web_touch", "mobile_app"],
    markets: ["RU", "BY", "KZ"],
    languages: ["ru"],
    roles: ["direct_client"],
    placements: ["maps", "search"],
    keywords: [
      "организация", "карты", "maps", "продвижение организаций",
      "company ads", "карточка организации",
    ],
  },
  {
    id: "context_banner",
    name: "Контекстный баннер в Поиске",
    description:
      "Медийный баннер справа от результатов поиска. Только Директ Про.",
    interfaces: ["web_desktop", "web_touch", "api", "commander"],
    markets: ["RU", "BY", "KZ", "UZ", "TR"],
    languages: ["ru", "en", "tr"],
    roles: ["direct_client", "agency", "agency_client"],
    placements: ["search"],
    keywords: [
      "контекстный баннер", "баннер на поиске", "media context banner",
    ],
  },
  {
    id: "dooh",
    name: "Наружная реклама (DOOH)",
    description:
      "Реклама на цифровых экранах на улицах. Бета-версия. Только Директ Про.",
    interfaces: ["web_desktop"],
    markets: ["RU"],
    languages: ["ru"],
    roles: ["direct_client", "agency"],
    placements: ["dooh"],
    keywords: [
      "наружная реклама", "DOOH", "цифровые экраны", "outdoor",
    ],
  },

  // --- Платформенный уровень ---
  {
    id: "platform",
    name: "Платформа Директа",
    description:
      "Общая платформа: модерация, оплата, БК, аналитика, логирование, A/B-тесты, фичефлаги. Затрагивает все продукты и интерфейсы.",
    interfaces: ["web_desktop", "web_touch", "mobile_app", "api", "commander", "excel"],
    markets: ["RU", "BY", "KZ", "UZ", "TR"],
    languages: ["ru", "en", "tr"],
    roles: [
      "direct_client", "agency", "agency_client", "representative_full",
      "representative_readonly", "mcc_admin", "mcc_edit", "mcc_readonly",
      "social_client", "internal_ads", "superuser", "superviewer",
      "support", "manager",
    ],
    placements: ["search", "rsya", "maps", "product_gallery", "telegram_channels", "dooh"],
    keywords: [
      "платформа", "баланс", "модерация", "БК", "баннерная крутилка",
      "фичефлаг", "санкции", "комплаенс", "маркировка", "оплата",
      "Метрика", "Аудитории", "логирование",
    ],
  },
];

/**
 * Build a compact summary of products for the Pre-Analysis prompt.
 * Keeps only id, name, and keywords to minimize token usage.
 */
export function getProductCatalogForPrompt(): string {
  return DIRECT_PRODUCTS.map(
    (p) => `- ${p.id}: ${p.name} (ключевые слова: ${p.keywords.join(", ")})`
  ).join("\n");
}

/**
 * Look up products by ids and build a context note describing
 * available interfaces, markets, and roles for the matched products.
 */
export function buildProductContextNote(productIds: string[]): string {
  const matched = DIRECT_PRODUCTS.filter((p) => productIds.includes(p.id));
  if (matched.length === 0) return "";

  const allInterfaces = new Set(matched.flatMap((p) => p.interfaces));
  const allMarkets = new Set(matched.flatMap((p) => p.markets));

  const missingInterfaces = INTERFACE_TYPES.filter((i) => !allInterfaces.has(i));

  const lines: string[] = [];
  lines.push(`Продукт(ы): ${matched.map((p) => p.name).join(", ")}.`);
  lines.push(
    `Доступные интерфейсы: ${[...allInterfaces].map((i) => INTERFACE_LABELS[i]).join(", ")}.`
  );
  if (missingInterfaces.length > 0) {
    lines.push(
      `Отсутствующие интерфейсы (НЕ требуй их описания): ${missingInterfaces.map((i) => INTERFACE_LABELS[i]).join(", ")}.`
    );
  }
  lines.push(`Рынки: ${[...allMarkets].join(", ")}.`);

  return lines.join("\n");
}

/**
 * Determine which criteria should be N/A based on product context.
 * Returns hard rules; the LLM Pre-Analysis may add more.
 */
export function getHardNaCriteria(
  productIds: string[]
): Array<{ criterion_id: CriterionId; reason: string }> {
  const matched = DIRECT_PRODUCTS.filter((p) => productIds.includes(p.id));
  if (matched.length === 0) return [];

  const allInterfaces = new Set(matched.flatMap((p) => p.interfaces));
  const allMarkets = new Set(matched.flatMap((p) => p.markets));

  const result: Array<{ criterion_id: CriterionId; reason: string }> = [];

  if (allMarkets.size === 1) {
    result.push({
      criterion_id: "international",
      reason: `Продукт работает только на одном рынке (${[...allMarkets][0]})`,
    });
  }

  const hasUiChange = matched.some(
    (p) =>
      p.interfaces.includes("web_desktop") ||
      p.interfaces.includes("web_touch") ||
      p.interfaces.includes("mobile_app")
  );
  if (!hasUiChange) {
    result.push({
      criterion_id: "design",
      reason: "Продукт не содержит пользовательского интерфейса",
    });
    result.push({
      criterion_id: "onboarding",
      reason: "Продукт не содержит пользовательского интерфейса",
    });
  }

  return result;
}
