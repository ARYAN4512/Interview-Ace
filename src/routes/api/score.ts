import { createFileRoute } from "@tanstack/react-router";
import { estimateScores, type ScoreResponse } from "@/lib/interview-data";

const MODEL = "gemini-3.6-flash";

function clampScore(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 60;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function normalize(raw: unknown, count: number): ScoreResponse | null {
  const obj = raw as { results?: unknown[]; overall_tips?: unknown[] } | null;
  if (!obj || !Array.isArray(obj.results) || obj.results.length === 0) return null;

  const results = Array.from({ length: count }, (_, i) => {
    const r = (obj.results?.[i] ?? {}) as Record<string, unknown>;
    return {
      content_score: clampScore(r["content_score"]),
      clarity_score: clampScore(r["clarity_score"]),
      confidence_score: clampScore(r["confidence_score"]),
      tip: typeof r["tip"] === "string" && r["tip"].trim() ? r["tip"].trim() : "Add a concrete outcome to close this answer.",
    };
  });

  const tips = (Array.isArray(obj.overall_tips) ? obj.overall_tips : [])
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .slice(0, 3);
  while (tips.length < 3) {
    tips.push("Quantify at least one result per answer — numbers make your stories memorable.");
  }

  return { results, overall_tips: tips };
}

export const Route = createFileRoute("/api/score")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let role = "";
        let questions: string[] = [];
        let answers: string[] = [];
        try {
          const body = (await request.json()) as {
            role?: string;
            questions?: string[];
            answers?: string[];
          };
          role = typeof body.role === "string" ? body.role : "";
          questions = Array.isArray(body.questions) ? body.questions.slice(0, 20) : [];
          answers = Array.isArray(body.answers) ? body.answers.slice(0, 20) : [];
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        if (questions.length === 0) {
          return Response.json({ error: "No questions provided" }, { status: 400 });
        }

        const apiKey = process.env["GEMINI_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "GEMINI_API_KEY is not configured", ...estimateScores(questions, answers) },
            { status: 200 },
          );
        }

        const transcript = questions
          .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${(answers[i] ?? "").trim() || "(no answer given)"}`)
          .join("\n\n");

        const prompt = `You are a senior interview coach reviewing a mock ${role || "job"} interview.
For EACH of the ${questions.length} question/answer pairs below, score 0-100 on:
- content_score: relevance, depth, structure and concrete evidence
- clarity_score: structure, concision, absence of filler and rambling
- confidence_score: decisiveness and conviction of the delivery
Also give one specific, actionable "tip" per question (max 25 words), and exactly 3 overall_tips for the session.
Empty or very short answers must score low. Be honest and specific, never generic praise.

${transcript}`;

        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.4,
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: "OBJECT",
                    properties: {
                      results: {
                        type: "ARRAY",
                        items: {
                          type: "OBJECT",
                          properties: {
                            content_score: { type: "NUMBER" },
                            clarity_score: { type: "NUMBER" },
                            confidence_score: { type: "NUMBER" },
                            tip: { type: "STRING" },
                          },
                          required: ["content_score", "clarity_score", "confidence_score", "tip"],
                        },
                      },
                      overall_tips: { type: "ARRAY", items: { type: "STRING" } },
                    },
                    required: ["results", "overall_tips"],
                  },
                },
              }),
            },
          );

          if (!res.ok) {
            const body = await res.text();
            console.error(`Gemini request failed [${res.status}]: ${body}`);
            return Response.json(
              { error: `Gemini request failed [${res.status}]` },
              { status: 502 },
            );
          }

          const json = (await res.json()) as {
            candidates?: { content?: { parts?: { text?: string }[] } }[];
          };
          const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
          const parsed = normalize(JSON.parse(text), questions.length);
          if (!parsed) throw new Error("Unexpected model response shape");

          return Response.json(parsed);
        } catch (error) {
          console.error("Scoring failed:", error);
          return Response.json({ error: "Scoring service failed" }, { status: 502 });
        }
      },
    },
  },
});
