import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RoleSelect } from "@/components/interview/RoleSelect";
import { InterviewStage } from "@/components/interview/InterviewStage";
import { Results } from "@/components/interview/Results";
import { getRole, type RoleId } from "@/lib/interview-data";

const TITLE = "InterviewAce — Speak your answers, get scored feedback";
const DESCRIPTION =
  "Practise tech, HR and consulting interviews out loud in your browser. InterviewAce transcribes your spoken answers and scores content, clarity and confidence.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

type Stage = "select" | "interview" | "results";

function Index() {
  const [stage, setStage] = useState<Stage>("select");
  const [roleId, setRoleId] = useState<RoleId | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 pt-8">
        <span className="font-display text-lg tracking-tight">
          Interview<span className="text-accent">Ace</span>
        </span>
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Voice practice
        </span>
      </header>

      {stage === "select" && (
        <RoleSelect
          selected={roleId}
          onSelect={setRoleId}
          onStart={() => roleId && setStage("interview")}
        />
      )}

      {stage === "interview" && roleId && (
        <InterviewStage
          role={getRole(roleId)}
          onExit={() => setStage("select")}
          onFinish={(collected) => {
            setAnswers(collected);
            setStage("results");
          }}
        />
      )}

      {stage === "results" && roleId && (
        <Results
          role={getRole(roleId)}
          answers={answers}
          onRestart={() => {
            setAnswers([]);
            setStage("select");
          }}
        />
      )}
    </main>
  );
}
