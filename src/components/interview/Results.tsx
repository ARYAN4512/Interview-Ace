import { useEffect, useState } from "react";
import { ScoreGauge } from "./ScoreGauge";
import { estimateScores, type Role, type ScoreResponse } from "@/lib/interview-data";

function scoreColor(score: number) {
  if (score >= 80) return "var(--score-high)";
  if (score >= 65) return "var(--score-mid)";
  return "var(--score-low)";
}

export function Results({
  role,
  answers,
  onRestart,
}: {
  role: Role;
  answers: string[];
  onRestart: () => void;
}) {
  const [data, setData] = useState<ScoreResponse | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: role.id, questions: role.questions, answers }),
        });
        if (!response.ok) throw new Error(String(response.status));
        const json = (await response.json()) as ScoreResponse;
        if (!Array.isArray(json?.results) || json.results.length === 0) throw new Error("bad shape");
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) {
          setFallback(true);
          setData(estimateScores(role.questions, answers));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role, answers]);

  if (!data) {
    return (
      <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-accent" />
        <h1 className="mt-8 text-2xl">Reviewing your answers</h1>
        <p className="mt-2 text-sm text-muted-foreground">Scoring content, clarity and confidence.</p>
      </section>
    );
  }

  const avg = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / Math.max(1, nums.length);
  const overall = avg(
    data.results.map((r) => (r.content_score + r.clarity_score + r.confidence_score) / 3),
  );

  return (
    <section className="animate-rise mx-auto w-full max-w-3xl px-6 py-14 sm:py-20">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{role.name} · Debrief</p>

      <div className="mt-8 flex flex-col items-center gap-10 sm:flex-row sm:items-center sm:gap-14">
        <ScoreGauge value={overall} label="Overall" />
        <div className="w-full">
          <h1 className="text-3xl sm:text-4xl">
            {overall >= 80 ? "Interview ready." : overall >= 62 ? "Nearly there." : "Worth another round."}
          </h1>
          <dl className="mt-6 grid grid-cols-3 gap-4">
            {[
              ["Content", avg(data.results.map((r) => r.content_score))],
              ["Clarity", avg(data.results.map((r) => r.clarity_score))],
              ["Confidence", avg(data.results.map((r) => r.confidence_score))],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-lg border border-border bg-card p-4">
                <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </dt>
                <dd
                  className="mt-1 font-display text-2xl tabular-nums"
                  style={{ color: scoreColor(value as number) }}
                >
                  {Math.round(value as number)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {fallback && (
        <p className="mt-8 rounded-lg border border-border bg-secondary px-4 py-3 text-xs text-muted-foreground">
          Scoring service unavailable — showing a local estimate of your performance.
        </p>
      )}

      <h2 className="mt-16 text-xl">Question breakdown</h2>
      <ol className="mt-6 space-y-4">
        {data.results.map((result, i) => {
          const score = Math.round(
            (result.content_score + result.clarity_score + result.confidence_score) / 3,
          );
          return (
            <li key={i} className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-start justify-between gap-6">
                <p className="text-sm font-medium leading-relaxed">{role.questions[i]}</p>
                <span
                  className="font-display text-2xl tabular-nums"
                  style={{ color: scoreColor(score) }}
                >
                  {score}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <span>Content {result.content_score}</span>
                <span>Clarity {result.clarity_score}</span>
                <span>Confidence {result.confidence_score}</span>
              </div>
              <p className="mt-4 border-l-2 border-border pl-4 text-sm leading-relaxed text-muted-foreground">
                {result.tip}
              </p>
            </li>
          );
        })}
      </ol>

      <h2 className="mt-16 text-xl">How to improve</h2>
      <ul className="mt-6 space-y-3">
        {data.overall_tips.map((tip, i) => (
          <li key={i} className="flex gap-4 text-sm leading-relaxed">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground"
              aria-hidden="true"
            />
            {tip}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onRestart}
        className="mt-14 w-full rounded-full bg-accent px-8 py-3.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 sm:w-auto"
      >
        Practise again
      </button>
    </section>
  );
}