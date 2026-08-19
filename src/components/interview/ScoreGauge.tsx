import { useEffect, useState } from "react";

export function ScoreGauge({ value, label }: { value: number; label: string }) {
  const [progress, setProgress] = useState(0);
  const radius = 88;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const id = window.setTimeout(() => setProgress(value), 120);
    return () => window.clearTimeout(id);
  }, [value]);

  return (
    <div
      className="relative h-52 w-52"
      role="img"
      aria-label={`${label}: ${Math.round(value)} out of 100`}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="10"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * progress) / 100}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl tabular-nums">{Math.round(value)}</span>
        <span className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}