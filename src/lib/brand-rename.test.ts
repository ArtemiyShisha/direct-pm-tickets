import { describe, expect, it } from "vitest";
import { renameBrandText } from "./brand-rename";

describe("renameBrandText", () => {
  it("replaces Direct.Pro with Директ Про", () => {
    expect(renameBrandText("В Direct.Pro есть фильтры")).toBe(
      "В Директ Про есть фильтры",
    );
  });

  it("replaces standalone Direct with Директ in flowing Cyrillic text", () => {
    expect(renameBrandText("Direct и Direct.Pro — две поверхности")).toBe(
      "Директ и Директ Про — две поверхности",
    );
  });

  it("replaces «Direct» (with guillemets) with «Директ»", () => {
    expect(renameBrandText('Названия «Direct» и «Direct.Pro»')).toBe(
      "Названия «Директ» и «Директ Про»",
    );
  });

  it("does not touch lowercase identifiers like direct_pro", () => {
    expect(renameBrandText("alias direct_pro and direct.pro")).toBe(
      "alias direct_pro and direct.pro",
    );
  });

  it("does not touch words that contain Direct as a substring", () => {
    expect(renameBrandText("Directives stay intact")).toBe(
      "Directives stay intact",
    );
  });

  it("leaves Light untouched in 'Direct Light' (manual rewrite handles that card)", () => {
    expect(renameBrandText('«Direct Light», «лёгкая версия»')).toBe(
      "«Директ Light», «лёгкая версия»",
    );
  });

  it("handles trailing punctuation around Direct", () => {
    expect(renameBrandText("по умолчанию — Direct.")).toBe(
      "по умолчанию — Директ.",
    );
    expect(renameBrandText("(Direct, Direct.Pro)")).toBe(
      "(Директ, Директ Про)",
    );
  });

  it("is idempotent on already-renamed text", () => {
    const renamed = "В Директ Про и Директ всё ок";
    expect(renameBrandText(renamed)).toBe(renamed);
  });
});
