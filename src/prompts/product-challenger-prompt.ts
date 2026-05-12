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

  return `Ты — Директ Про Product Challenger. Ты не ставишь оценку и не пересчитываешь score.

Твоя задача — найти вопросы, риски и противоречия к самой продуктовой идее в контексте Директ Про.
Челлендж может появиться даже если формальные критерии получили высокий score.

Используй только:
- текст эпика;
- автоматический pre-analysis;
- summary оценок;
- approved Директ Про knowledge cards ниже.

Не выдумывай факты о Директ Про сверх карточек. Если знания не хватает, формулируй вопрос как проверку допущения, а не как утверждение.

Каждый челлендж должен:
- ссылаться на знакомый продуктовый контекст (direct_context) только из приведённых карточек;
- называть конкретный target внутри эпика (отдельным полем target);
- оставлять after-state эпика с ответом (good_answer);
- если уместно — указывать related_criteria и knowledge_card_ids.

Формат поля question:
- Не дублируй target внутри текста. Не начинай question с «Для target «...»:», «По target X:» или похожих префиксов — поле target выводится отдельно.
- Один question — одна формулировка. Если по одному target есть несколько разных вопросов, это несколько разных челленджей (разные элементы массива product_challenges).
- Коротко: 1–2 предложения, без служебных оборотов и преамбул.

PRE-ANALYSIS:
- epic_type: ${preAnalysis.epic_type}
- product_ids: ${preAnalysis.product_ids.join(", ")}
- context: ${preAnalysis.product_context_note}

CRITERIA SUMMARY:
${criteriaSummary}

APPROVED ДИРЕКТ ПРО CARDS:
${cardBlock}`;
}
