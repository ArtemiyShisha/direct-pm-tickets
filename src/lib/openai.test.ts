import { afterEach, describe, expect, it } from "vitest";
import { isProductChallengerEnabled } from "./openai";

const ENV_KEY = "PRODUCT_CHALLENGER_ENABLED";

describe("isProductChallengerEnabled", () => {
  afterEach(() => {
    delete process.env[ENV_KEY];
  });

  it("is false by default (env var not set)", () => {
    delete process.env[ENV_KEY];
    expect(isProductChallengerEnabled()).toBe(false);
  });

  it("is false when env var is anything other than 'true'", () => {
    process.env[ENV_KEY] = "1";
    expect(isProductChallengerEnabled()).toBe(false);
    process.env[ENV_KEY] = "yes";
    expect(isProductChallengerEnabled()).toBe(false);
    process.env[ENV_KEY] = "TRUE";
    expect(isProductChallengerEnabled()).toBe(false);
  });

  it("is true when env var is exactly 'true'", () => {
    process.env[ENV_KEY] = "true";
    expect(isProductChallengerEnabled()).toBe(true);
  });
});
