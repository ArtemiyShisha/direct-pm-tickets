import { describe, expect, it } from "vitest";
import { directProKnowledgeCardSchema } from "../schema";
import { FORMATS_SHOWS_DIRECT_PRO_CARDS } from "./formats-shows";
import { DIRECT_PRO_KNOWLEDGE_CARDS } from "./index";
import { TARGETING_SEMANTICS_DIRECT_PRO_CARDS } from "./targeting-semantics";

describe("DIRECT_PRO_KNOWLEDGE_CARDS", () => {
  it("contains unique card ids", () => {
    const ids = DIRECT_PRO_KNOWLEDGE_CARDS.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains cards for the core campaign hierarchy", () => {
    expect(DIRECT_PRO_KNOWLEDGE_CARDS.map((card) => card.id)).toEqual(
      expect.arrayContaining([
        "entity.campaign",
        "entity.ad_group",
        "entity.ad",
      ]),
    );
  });

  it("contains promoted formats and shows cards", () => {
    expect(DIRECT_PRO_KNOWLEDGE_CARDS.map((card) => card.id)).toEqual(
      expect.arrayContaining(
        FORMATS_SHOWS_DIRECT_PRO_CARDS.map((card) => card.id),
      ),
    );
  });

  it("contains promoted targeting semantics cards", () => {
    expect(DIRECT_PRO_KNOWLEDGE_CARDS.map((card) => card.id)).toEqual(
      expect.arrayContaining(
        TARGETING_SEMANTICS_DIRECT_PRO_CARDS.map((card) => card.id),
      ),
    );
  });

  it("conforms every card to the knowledge card schema", () => {
    for (const card of DIRECT_PRO_KNOWLEDGE_CARDS) {
      expect(() => directProKnowledgeCardSchema.parse(card)).not.toThrow();
    }
  });
});
