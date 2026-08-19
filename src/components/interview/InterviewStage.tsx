import { useEffect, useState } from "react";
import { Mic, Square, Volume2 } from "lucide-react";
import { speak, stopSpeaking, useSpeechRecognition } from "@/hooks/useSpeech";
import type { Role } from "@/lib/interview-data";

export function InterviewStage({
  role,
  onFinish,
  onExit,
}: {
  role: Role;
  onFinish: (answers: string[]) => void;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const speech = useSpeechRecognition();
  const question = role.questions[index] as string;
  const isLast = index === role.questions.length - 1;

  useEffect(() => {
    speech.reset();
    speak(question);
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const spoken = `${speech.transcript} ${speech.interim}`.trim();

  const advance = () => {
    speech.stop();
    stopSpeaking();
    const next = [...answers, spoken];
    setAnswers(next);
    if (isLast) onFinish(next);
    else setIndex((i) => i + 1);
  };

  const errorMessage = (() => {
    if (!speech.supported)
      return "Your browser doesn't support speech recognition. Please use Google Chrome on desktop or Android.";
    if (speech.error === "denied")
      return "Microphone access was blocked. Allow the microphone in your browser's site settings, then try again.";
    if (speech.error === "no-speech")
      return "We didn't hear anything. Check your mic input and speak a little closer.";
    if (speech.error === "generic")
      return "Recording stopped unexpectedly. Try starting the recorder again.";
    return null;
  })();

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{role.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Question {index + 1} of {role.questions.length}
          </p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary"
        >
          End session
        </button>
      </div>

      <div className="mt-5 flex gap-1.5" aria-hidden="true">
        {role.questions.map((_, i) => (
          <span
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
              i <= index ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>

      <div key={index} className="animate-rise mt-12">
        <h1 className="text-2xl leading-snug sm:text-4xl">{question}</h1>
        <button
          type="button"
          onClick={() => speak(question)}
          className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Replay the question audio"
        >
          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" /> Replay question
        </button>
      </div>

      <div className="mt-12 flex flex-col items-center">
        <div className="relative">
          {speech.listening && (
            <span
              className="animate-pulse-ring absolute inset-0 rounded-full bg-accent"
              aria-hidden="true"
            />
          )}
          <button
            type="button"
            onClick={() => (speech.listening ? speech.stop() : speech.start())}
            disabled={!speech.supported}
            aria-label={speech.listening ? "Stop recording your answer" : "Start recording your answer"}
            aria-pressed={speech.listening}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
              speech.listening
                ? "bg-accent text-accent-foreground shadow-lift"
                : "bg-primary text-primary-foreground shadow-soft hover:scale-[1.03]"
            }`}
          >
            {speech.listening ? (
              <Square className="h-7 w-7" aria-hidden="true" />
            ) : (
              <Mic className="h-8 w-8" aria-hidden="true" />
            )}
          </button>
        </div>
        <p aria-live="polite" className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {speech.listening ? "Listening — tap to stop" : "Tap to answer aloud"}
        </p>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="mt-8 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      )}

      <div className="mt-10 min-h-32 rounded-xl border border-border bg-card p-6 shadow-soft">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Live transcript</p>
        <p aria-live="polite" className="mt-3 text-base leading-relaxed">
          {spoken || (
            <span className="text-muted-foreground">
              Your words will appear here as you speak.
            </span>
          )}
        </p>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={advance}
          className="w-full rounded-full bg-accent px-8 py-3.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 sm:w-auto"
        >
          {isLast ? "Finish & score" : "Next question"}
        </button>
      </div>
    </section>
  );
}