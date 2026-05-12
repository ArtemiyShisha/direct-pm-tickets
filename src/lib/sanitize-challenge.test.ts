import { describe, expect, it } from "vitest";
import { sanitizeChallengeQuestion } from "./sanitize-challenge";

describe("sanitizeChallengeQuestion", () => {
  it("strips «Для target «X»:» prefix with guillemets", () => {
    const raw =
      "Для target «ручное обновление ТГО»: это изменение типа существующей кампании?";
    expect(sanitizeChallengeQuestion(raw)).toBe(
      "это изменение типа существующей кампании?",
    );
  });

  it('strips "Для target "X":" prefix with double quotes', () => {
    const raw = 'Для target "X": rest of question?';
    expect(sanitizeChallengeQuestion(raw)).toBe("rest of question?");
  });

  it("strips «Для X:» prefix when target is provided as an argument", () => {
    const raw =
      "Для ручное обновление ТГО: что остаётся неизменным для пользователя?";
    expect(sanitizeChallengeQuestion(raw, "ручное обновление ТГО")).toBe(
      "что остаётся неизменным для пользователя?",
    );
  });

  it("strips «По target X:» prefix", () => {
    expect(
      sanitizeChallengeQuestion("По target «копирование кампании»: вопрос?"),
    ).toBe("вопрос?");
  });

  it("does not touch a normal question without preamble", () => {
    const raw = "Что остаётся неизменным для пользователя?";
    expect(sanitizeChallengeQuestion(raw)).toBe(raw);
  });

  it("is idempotent on already-sanitized text", () => {
    const once = sanitizeChallengeQuestion(
      "Для target «X»: реальный вопрос?",
    );
    expect(sanitizeChallengeQuestion(once)).toBe(once);
  });

  it("returns the original input when stripping would leave it empty", () => {
    const raw = "Для target «X»:";
    expect(sanitizeChallengeQuestion(raw)).toBe(raw);
  });

  it("does not crash with empty target argument", () => {
    expect(sanitizeChallengeQuestion("Обычный вопрос?", "")).toBe(
      "Обычный вопрос?",
    );
  });
});
