import { CORE_DIRECT_PRO_CARDS } from "./core";
import { CAMPAIGN_TYPE_DIRECT_PRO_CARDS } from "./campaign-types";
import { CAMPAIGN_GROUP_SETTINGS_DIRECT_PRO_CARDS } from "./campaign-group-settings";

export const DIRECT_PRO_KNOWLEDGE_CARDS = [
  ...CORE_DIRECT_PRO_CARDS,
  ...CAMPAIGN_TYPE_DIRECT_PRO_CARDS,
  ...CAMPAIGN_GROUP_SETTINGS_DIRECT_PRO_CARDS,
] as const;
