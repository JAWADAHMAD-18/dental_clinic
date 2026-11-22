"use client";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const QUESTIONS = [
  "What are your opening hours?",
  "Do you see children?",
  "How much is a check-up and clean?",
  "What should I do in a dental emergency?",
];

export function SuggestedQuestions({ onSelect, disabled }: SuggestedQuestionsProps) {
  return (
    <div className="p-4 space-y-2">
      <p className="text-xs font-medium text-ink-soft">Suggested questions</p>
      <div className="flex flex-wrap gap-2">
        {QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(q)}
            className="text-left text-xs bg-sand/70 text-ink hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
