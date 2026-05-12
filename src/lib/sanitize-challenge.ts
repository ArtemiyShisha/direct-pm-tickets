/**
 * Strip leading "Для target «X»:" / "По target X:" preambles from
 * Product Challenger `question` text. The model occasionally inlines the
 * target into the question even though `target` is rendered as a separate
 * field; this helper is a defense-in-depth strip.
 *
 * Returns the trimmed remainder. If the strip would yield an empty string,
 * returns the original input unchanged (better to show clutter than nothing).
 */
export function sanitizeChallengeQuestion(
  raw: string,
  target?: string,
): string {
  if (!raw) return raw;

  let out = raw;

  out = out.replace(/^\s*(?:для|по)\s+target\s*[«"']?[^«»"']*[»"']?\s*[:\-—]\s*/i, "");

  if (target && target.trim().length > 0) {
    const escaped = target.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`^\\s*(?:для|по)\\s+["«']?${escaped}["»']?\\s*[:\\-—]\\s*`, "i");
    out = out.replace(re, "");
  }

  out = out.replace(/^\s*[:\-—,.]+\s*/, "").trim();

  return out.length > 0 ? out : raw;
}
