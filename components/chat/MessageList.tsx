"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, AlertCircle } from "lucide-react";
import { clinic } from "@/content/clinic";
import { ChatMessageUI } from "./types";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
  messages: ChatMessageUI[];
  isLoading: boolean;
  onRetry?: () => void;
  onCloseChat?: () => void;
}

export function MessageList({
  messages,
  isLoading,
  onRetry,
  onCloseChat,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages.map((msg) => {
        const isUser = msg.role === "user";

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                isUser
                  ? "bg-ink text-bone rounded-tr-sm"
                  : "bg-paper text-ink border border-line rounded-tl-sm shadow-xs"
              }`}
            >
              {msg.content}
            </div>

            {/* Error states */}
            {msg.error && (
              <div className="mt-2 text-xs text-clay-text bg-clay/10 border border-clay/20 rounded-lg p-2.5 max-w-[85%] space-y-2">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-clay" />
                  <div>
                    {msg.error === "rate_limited" && (
                      <p>You&apos;re sending messages quickly. Please wait a moment.</p>
                    )}
                    {msg.error === "unavailable" && (
                      <p>
                        Alder is resting right now. You can call us on{" "}
                        <a
                          href={`tel:${clinic.phone.replace(/[^0-9]/g, "")}`}
                          className="font-medium underline hover:text-ink"
                        >
                          {clinic.phone}
                        </a>{" "}
                        or use the{" "}
                        <Link
                          href="/contact"
                          onClick={onCloseChat}
                          className="font-medium underline hover:text-ink"
                        >
                          enquiry form
                        </Link>
                        .
                      </p>
                    )}
                    {msg.error === "network" && (
                      <p>Something went wrong connecting to Alder. Please check your connection and try again.</p>
                    )}
                  </div>
                </div>

                {msg.error === "network" && onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-clay hover:text-clay-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded px-1.5 py-0.5 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            )}

            {/* "Based on" source citation */}
            {!isUser && msg.basedOn && msg.basedOn.length > 0 && (
              <p className="mt-1 text-[11px] text-ink-soft">
                Based on: {msg.basedOn.join(", ")}
              </p>
            )}

            {/* "Make an enquiry" booking action button */}
            {!isUser && msg.isBookingIntent && (
              <div className="mt-2.5">
                <Link
                  href="/contact"
                  onClick={onCloseChat}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-clay text-white text-xs font-medium hover:bg-clay-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <span>Make an enquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        );
      })}

      {isLoading && (
        <div className="flex items-start">
          <TypingIndicator />
        </div>
      )}

      <div ref={bottomRef} tabIndex={-1} aria-hidden="true" />
    </div>
  );
}
