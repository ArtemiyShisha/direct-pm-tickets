import type { CriterionResult, PreAnalysisResult } from "@/lib/types";
import type { DirectProKnowledgeCard } from "@/knowledge/direct-pro/schema";

export function buildProductChallengerPrompt(
  preAnalysis: PreAnalysisResult,
  criteria: CriterionResult[],
  cards: DirectProKnowledgeCard[],
): string {
  const criteriaSummary = criteria
    .map(
      (criterion) =>
        `- ${criterion.id}: score=${criterion.score}; status=${criterion.status}; comment=${criterion.comment}`,
    )
    .join("\n");

  const cardBlock = cards
    .map((card) => {
      const rules = card.challengeRules
        .map((rule) => `- ${rule.id} (${rule.severity}): ${rule.challenge}`)
        .join("\n");
      const rulesSection = rules.length > 0 ? `\nchallenge rules:\n${rules}` : "";
      return `CARD ${card.id}
kind: ${card.kind}
label: ${card.label}
summary: ${card.summary}${rulesSection}`;
    })
    .join("\n\n");

  return `Ты — Direct.Pro Product Challenger. Ты не ставишь оценку и не пересчитываешь score.

Твоя задача — найти вопросы, риски и противоречия к самой продуктовой идее в контексте Direct.Pro.
Челлендж может появиться даже если формальные критерии получили высокий score.

Используй только:
- текст эпика;
- автоматический pre-analysis;
- summary оценок;
- approved Direct.Pro knowledge cards ниже.

Не выдумывай факты о Direct.Pro сверх карточек. Если знания не хватает, формулируй вопрос как проверку допущения, а не как утверждение.

Каждый челлендж должен:
- ссылаться на знакомый продуктовый контекст (direct_context) только из приведённых карточек;
- называть конкретный target внутри эпика;
- оставлять after-state эпика с ответом (good_answer);
- если уместно — указывать related_criteria и knowledge_card_ids.

PRE-ANALYSIS:
- epic_type: ${preAnalysis.epic_type}
- product_ids: ${preAnalysis.product_ids.join(", ")}
- context: ${preAnalysis.product_context_note}

CRITERIA SUMMARY:
${criteriaSummary}

APPROVED DIRECT.PRO CARDS:
${cardBlock}`;
}
