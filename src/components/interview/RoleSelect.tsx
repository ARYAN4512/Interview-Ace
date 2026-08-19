import { ROLES, type RoleId } from "@/lib/interview-data";

export function RoleSelect({
  selected,
  onSelect,
  onStart,
}: {
  selected: RoleId | null;
  onSelect: (id: RoleId) => void;
  onStart: () => void;
}) {
  return (
    <section className="animate-rise mx-auto w-full max-w-4xl px-6 py-16 sm:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Mock interview practice
      </p>
      <h1 className="mt-5 max-w-2xl text-4xl leading-[1.05] sm:text-6xl">
        Rehearse out loud.
        <br />
        <span className="text-accent">Get told the truth.</span>
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
        Pick a track, answer five questions with your voice, and receive a scored breakdown of your
        content, clarity and confidence.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {ROLES.map((role) => {
          const active = selected === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelect(role.id)}
              aria-pressed={active}
              className={`group flex h-full flex-col rounded-xl border bg-card p-6 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift ${
                active
                  ? "border-accent shadow-lift ring-1 ring-accent"
                  : "border-border shadow-soft"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${active ? "bg-accent" : "bg-border"}`}
                aria-hidden="true"
              />
              <h2 className="mt-6 text-xl">{role.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {role.tagline}
              </p>
              <span className="mt-6 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {role.meta}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onStart}
          disabled={!selected}
          className="w-full rounded-full bg-accent px-8 py-3.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
        >
          Start interview
        </button>
        <p className="text-xs text-muted-foreground">
          Uses your browser&apos;s built-in speech recognition. Chrome recommended.
        </p>
      </div>
    </section>
  );
}