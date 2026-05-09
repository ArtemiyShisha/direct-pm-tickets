import { DIRECT_PRO_KNOWLEDGE_CARDS } from "./cards";
import type { DirectProKnowledgeCard } from "./schema";

function normalize(text: string): string {
  return text.toLocaleLowerCase("ru-RU");
}

export function selectDirectProCards(
  epicText: string,
): DirectProKnowledgeCard[] {
  const normalized = normalize(epicText);

  return DIRECT_PRO_KNOWLEDGE_CARDS.filter((card) =>
    card.aliases.some((alias) => normalized.includes(normalize(alias))),
  );
}
