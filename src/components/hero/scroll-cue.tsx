interface ScrollCueProps {
  label: string;
}

/** Purely decorative scroll hint — pure CSS animation, no client JS required. */
export function ScrollCue({ label }: ScrollCueProps) {
  return (
    <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2 text-ink-muted">
      <span className="text-xs uppercase tracking-[0.2em]">{label}</span>
      <span
        aria-hidden="true"
        className="h-9 w-px bg-gradient-to-b from-gold to-transparent motion-safe:animate-bounce motion-reduce:animate-none"
      />
    </div>
  );
}
