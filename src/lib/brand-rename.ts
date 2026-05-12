/**
 * Replace user-facing brand strings:
 *   "Direct.Pro" → "Директ Про"
 *   "«Direct»"   → "«Директ»"
 *   standalone "Direct" (word boundary) → "Директ"
 *
 * Idempotent and safe for code-shaped tokens (`direct_pro`, `direct.pro`,
 * `Directives`) because:
 *   - the lowercase "direct" tokens are skipped by case-sensitive matching;
 *   - `Direct\.Pro` runs first and consumes the dotted form;
 *   - `\bDirect\b` requires word boundaries on both sides, so substrings
 *     inside identifiers are not matched.
 */
export function renameBrandText(input: string): string {
  return input
    .replace(/Direct\.Pro/g, "Директ Про")
    .replace(/«Direct»/g, "«Директ»")
    .replace(/\bDirect\b/g, "Директ");
}
