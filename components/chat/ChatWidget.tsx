"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { clinic } from "@/content/clinic";
import { ChatMessageUI } from "./types";
import { MessageList } from "./MessageList";
import { SuggestedQuestions } from "./SuggestedQuestions";

const MAX_CHARS = 500;

function checkBookingIntent(assistantText: string, userText: string): boolean {
  const combined = `${userText} ${assistantText}`.toLowerCase();
  return (
    combined.includes("enquiry form") ||
    combined.includes("make an enquiry") ||
    combined.includes("contact page") ||
    combined.includes("cannot book") ||
    combined.includes("can't book") ||
    combined.includes("book an appointment") ||
    combined.includes("booking an appointment") ||
    combined.includes("book me") ||
    combined.includes("schedule an appointment")
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageUI[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastUserPromptRef = useRef<string>("");

  // Listen for open-alder-chat custom event
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("open-alder-chat", handleOpen);
    return () => window.removeEventListener("open-alder-chat", handleOpen);
  }, []);

  // Keyboard accessibility: ESC to close, autofocus input on open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      setTimeout(() => inputRef.current?.focus(), 150);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (textToSend: string) => {
      const trimmed = textToSend.trim();
      if (!trimmed || isLoading || trimmed.length > MAX_CHARS) return;

      lastUserPromptRef.current = trimmed;
      setInput("");

      const userMsgId = `user-${Date.now()}`;
      const assistantMsgId = `assistant-${Date.now()}`;

      const userMsg: ChatMessageUI = {
        id: userMsgId,
        role: "user",
        content: trimmed,
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setIsLoading(true);

      // Build payload for /api/chat: max last 8 messages
      const apiMessages = updatedMessages
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (res.status === 429) {
          setMessages((prev) => [
            ...prev,
            {
              id: assistantMsgId,
              role: "assistant",
              content: "",
              error: "rate_limited",
            },
          ]);
          setIsLoading(false);
          return;
        }

        if (res.status === 503) {
          setMessages((prev) => [
            ...prev,
            {
              id: assistantMsgId,
              role: "assistant",
              content: "",
              error: "unavailable",
            },
          ]);
          setIsLoading(false);
          return;
        }

        if (!res.ok) {
          setMessages((prev) => [
            ...prev,
            {
              id: assistantMsgId,
              role: "assistant",
              content: "",
              error: "network",
            },
          ]);
          setIsLoading(false);
          return;
        }

        const basedOnHeader = res.headers.get("X-Based-On");
        const basedOn = basedOnHeader
          ? basedOnHeader
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        // Insert assistant placeholder
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: "assistant",
            content: "",
            basedOn: basedOn.length > 0 ? basedOn : undefined,
          },
        ]);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("Stream reader unavailable");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
            )
          );
        }

        // Final update with booking intent analysis
        const isBooking = checkBookingIntent(accumulated, trimmed);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: accumulated, isBookingIntent: isBooking }
              : msg
          )
        );
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: "assistant",
            content: "",
            error: "network",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleRetry = () => {
    if (lastUserPromptRef.current) {
      // Remove failed assistant message before retrying
      setMessages((prev) => prev.filter((m) => !m.error));
      sendMessage(lastUserPromptRef.current);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={
          isOpen ? "Close Alder assistant chat" : "Open Alder virtual assistant"
        }
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-clay text-white shadow-lg flex items-center justify-center hover:bg-clay-text transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </button>

      {/* Chat panel */}
      <div
        role="dialog"
        aria-label="Alder, virtual assistant chat"
        aria-modal="true"
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[calc(100vh-7rem)] bg-paper border border-line rounded-2xl shadow-xl flex flex-col overflow-hidden transition-all duration-200 origin-bottom-right motion-reduce:transition-none ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-ink text-bone border-b border-ink/10 flex items-start justify-between gap-3 shrink-0">
          <div>
            <h2 className="font-serif text-base font-medium tracking-tight">
              Alder, virtual assistant
            </h2>
            <p className="text-xs text-sand/90 mt-0.5 leading-relaxed">
              I answer questions about the clinic using its published
              information. I&apos;m an AI, not a dentist.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              buttonRef.current?.focus();
            }}
            aria-label="Close chat"
            className="text-sand/80 hover:text-white p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Suggested questions (shown when no messages yet) */}
        {messages.length === 0 && (
          <SuggestedQuestions
            onSelect={(q) => sendMessage(q)}
            disabled={isLoading}
          />
        )}

        {/* Message list */}
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onRetry={handleRetry}
          onCloseChat={() => setIsOpen(false)}
        />

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-paper border-t border-line shrink-0"
        >
          <div className="relative flex items-center bg-sand/30 border border-line rounded-xl focus-within:ring-2 focus-within:ring-focus focus-within:border-transparent transition-all">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={MAX_CHARS}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="w-full resize-none bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none max-h-24"
            />
            <div className="flex items-center gap-2 pr-2">
              <span
                className={`text-[10px] tabular-nums font-mono ${
                  input.length >= MAX_CHARS ? "text-clay font-medium" : "text-ink-soft/80"
                }`}
                aria-live="polite"
              >
                {input.length}/{MAX_CHARS}
              </span>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="p-1.5 rounded-lg bg-clay text-white hover:bg-clay-text disabled:opacity-40 disabled:hover:bg-clay transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Footer disclaimer notice */}
          <p className="mt-2 text-[11px] text-ink-soft/90 text-center leading-tight">
            {clinic.sampleLabels.chatNotice}
          </p>
        </form>
      </div>
    </>
  );
}
