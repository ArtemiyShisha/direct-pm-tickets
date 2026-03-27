"use client";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "lg";
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

function getScoreTrack(score: number): string {
  if (score >= 70) return "stroke-emerald-600";
  if (score >= 40) return "stroke-amber-500";
  return "stroke-red-500";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Отлично";
  if (score >= 70) return "Хорошо";
  if (score >= 50) return "Средне";
  if (score >= 30) return "Слабо";
  return "Плохо";
}

export function ScoreBadge({ score, size = "lg" }: ScoreBadgeProps) {
  const isLarge = size === "lg";
  const viewSize = 120;
  const strokeWidth = 8;
  const radius = (viewSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex flex-col items-center gap-2 ${isLarge ? "" : "scale-75"}`}>
      <div className="relative" style={{ width: viewSize, height: viewSize }}>
        <svg
          width={viewSize}
          height={viewSize}
          className="-rotate-90"
        >
          <circle
            cx={viewSize / 2}
            cy={viewSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/50"
          />
          <circle
            cx={viewSize / 2}
            cy={viewSize / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${getScoreTrack(score)} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold tabular-nums ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground">из 100</span>
        </div>
      </div>
      {isLarge && (
        <span className={`text-sm font-medium ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
