import { createFileRoute } from "@tanstack/react-router";
import { estimateScores } from "@/lib/interview-data";

// Placeholder scoring endpoint. Swap the body of the handler for a real AI call.
export const Route = createFileRoute("/api/score")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let questions: string[] = [];
        let answers: string[] = [];
        try {
          const body = (await request.json()) as { questions?: string[]; answers?: string[] };
          questions = Array.isArray(body.questions) ? body.questions : [];
          answers = Array.isArray(body.answers) ? body.answers : [];
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const payload = estimateScores(questions, answers);
        return new Response(JSON.stringify(payload), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});