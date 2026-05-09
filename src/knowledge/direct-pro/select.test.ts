import { describe, expect, it } from "vitest";
import { selectDirectProCards } from "./select";

describe("selectDirectProCards", () => {
  it("selects group-related cards when an epic mentions groups", () => {
    const cards = selectDirectProCards(
      "Нужно массово изменить настройки групп объявлений.",
    );
    expect(cards.map((card) => card.id)).toContain("entity.ad_group");
  });

  it("selects campaign-related cards when an epic mentions campaigns", () => {
    const cards = selectDirectProCards(
      "Добавляем новую настройку кампании в Директ Про.",
    );
    expect(cards.map((card) => card.id)).toContain("entity.campaign");
  });

  it("selects ad-related cards when an epic mentions ads", () => {
    const cards = selectDirectProCards(
      "Меняем формат объявлений и порядок их модерации.",
    );
    expect(cards.map((card) => card.id)).toContain("entity.ad");
  });

  it("returns an empty list when no aliases match", () => {
    const cards = selectDirectProCards("Совершенно посторонний текст без связи с продуктом.");
    expect(cards).toEqual([]);
  });

  it("matches case-insensitively", () => {
    const cards = selectDirectProCards("CAMPAIGN level rollout plan.");
    expect(cards.map((card) => card.id)).toContain("entity.campaign");
  });
});
