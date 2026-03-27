"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircleQuestion } from "lucide-react";

interface QuestionsListProps {
  questions: string[];
}

export function QuestionsList({ questions }: QuestionsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircleQuestion className="h-5 w-5" />
          Вопросы к менеджеру продукта
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {questions.map((question, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                {i + 1}
              </span>
              <span className="pt-0.5">{question}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
