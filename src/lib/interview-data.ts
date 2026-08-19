export type RoleId = "tech" | "hr" | "consulting";

export type Role = {
  id: RoleId;
  name: string;
  tagline: string;
  meta: string;
  questions: string[];
};

export const ROLES: Role[] = [
  {
    id: "tech",
    name: "Tech / SDE",
    tagline: "System design, problem solving and engineering trade-offs.",
    meta: "5 questions · ~10 min",
    questions: [
      "Walk me through a technically challenging project you owned end to end.",
      "How would you design a URL shortener that handles a billion redirects a month?",
      "Tell me about a production bug you debugged under pressure. What was your process?",
      "How do you decide between shipping fast and paying down technical debt?",
      "Describe a time you disagreed with a code review. How did you resolve it?",
    ],
  },
  {
    id: "hr",
    name: "HR / Behavioural",
    tagline: "Motivation, teamwork and the story behind your resume.",
    meta: "5 questions · ~8 min",
    questions: [
      "Tell me about yourself and what brought you to this role.",
      "Describe a conflict with a teammate and how you handled it.",
      "What is a piece of feedback that genuinely changed how you work?",
      "Tell me about a time you failed. What did you take from it?",
      "Where do you want your career to be in three years, and why here?",
    ],
  },
  {
    id: "consulting",
    name: "Consulting",
    tagline: "Case structuring, estimation and crisp recommendations.",
    meta: "5 questions · ~12 min",
    questions: [
      "A coffee chain's profits fell 20% while revenue held flat. How do you diagnose it?",
      "Estimate the number of electric buses needed to serve a city of 5 million.",
      "A retail client wants to enter a new market. How would you structure the analysis?",
      "How would you present a recommendation the client clearly does not want to hear?",
      "Tell me about a time you influenced a decision without formal authority.",
    ],
  },
];

export function getRole(id: RoleId): Role {
  return ROLES.find((r) => r.id === id) ?? ROLES[0];
}

export type QuestionResult = {
  content_score: number;
  clarity_score: number;
  confidence_score: number;
  tip: string;
};

export type ScoreResponse = {
  results: QuestionResult[];
  overall_tips: string[];
};

const FILLERS = /\b(um|uh|like|you know|basically|actually|sort of|kind of)\b/gi;

/** Deterministic local estimate used by the API stub and as a client fallback. */
export function estimateScores(questions: string[], answers: string[]): ScoreResponse {
  const results = answers.map((answer) => {
    const text = (answer ?? "").trim();
    const words = text ? text.split(/\s+/).length : 0;
    const fillers = (text.match(FILLERS) ?? []).length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
    const avgSentence = words / sentences;

    const clamp = (n: number) => Math.max(20, Math.min(98, Math.round(n)));
    const content = clamp(40 + Math.min(words, 160) * 0.32);
    const clarity = clamp(88 - fillers * 6 - Math.max(0, avgSentence - 26) * 1.5);
    const confidence = clamp(60 + Math.min(words, 120) * 0.2 - fillers * 4);

    let tip = "Solid answer — tighten the ending with a one-line summary of the outcome.";
    if (words < 25) tip = "Too brief. Add concrete context, the action you took, and a measurable result.";
    else if (fillers > 3) tip = `You used ${fillers} filler words. Pause silently instead — it reads as confidence.`;
    else if (avgSentence > 30) tip = "Sentences run long. Break the answer into shorter, structured beats.";

    return { content_score: content, clarity_score: clarity, confidence_score: confidence, tip };
  });

  const avg = (k: keyof QuestionResult) =>
    results.reduce((s, r) => s + (r[k] as number), 0) / Math.max(1, results.length);

  const overall_tips: string[] = [];
  if (avg("content_score") < 70)
    overall_tips.push("Use the STAR structure — Situation, Task, Action, Result — so every answer lands a concrete outcome.");
  if (avg("clarity_score") < 78)
    overall_tips.push("Slow down and replace filler words with short pauses; it makes you sound far more deliberate.");
  if (avg("confidence_score") < 75)
    overall_tips.push("Open each answer with a direct one-sentence verdict before you explain the detail.");
  overall_tips.push("Quantify at least one result per answer — numbers make your stories memorable.");
  overall_tips.push("Practise the same set again and try to cut 20% of the words without losing meaning.");

  return { results, overall_tips };
}