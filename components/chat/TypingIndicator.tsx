"use client";

export function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="Alder is typing"
      className="flex items-center gap-1.5 px-3 py-2 bg-sand/40 border border-line rounded-2xl w-fit"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-ink-soft animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-soft animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-ink-soft animate-bounce" />
      <span className="sr-only">Alder is typing a response</span>
    </div>
  );
}
