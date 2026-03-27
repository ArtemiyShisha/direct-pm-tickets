"use client";

import { useState } from "react";
import { EpicInput } from "@/components/epic-input";
import { EvaluationResultView } from "@/components/evaluation-result";
import type { EvaluationResult } from "@/lib/types";
import { ClipboardCheck } from "lucide-react";

export default function Home() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Ошибка сервера: ${response.status}`);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Epic Reviewer
            </h1>
          </div>
          <p className="text-muted-foreground">
            Автоматическая оценка эпиков и PRD по 14 критериям качества.
            Вставьте текст эпика или загрузите .md файл.
          </p>
        </header>

        <section className="mb-10">
          <EpicInput onSubmit={handleSubmit} isLoading={isLoading} />
        </section>

        {error && (
          <div className="mb-8 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {result && (
          <section>
            <EvaluationResultView result={result} />
          </section>
        )}
      </div>
    </main>
  );
}
