"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { clinic } from "@/content/clinic";
import { ChatMessageUI, Slot, AppointmentConfirmed } from "./types";
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

        // Insert assistant placeholder
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: "assistant",
            content: "",
          },
        ]);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("Stream reader unavailable");

        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedText = "";
        let hasSlots = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            try {
              const event = JSON.parse(trimmedLine);

              if (event.type === "sources" && Array.isArray(event.headings)) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, basedOn: event.headings }
                      : msg
                  )
                );
              } else if (event.type === "slots") {
                hasSlots = (event.slots && event.slots.length > 0) || (event.alternatives && event.alternatives.length > 0);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          slots: event.slots ?? [],
                          alternatives: event.alternatives ?? [],
                        }
                      : msg
                  )
                );
              } else if (event.type === "text" && typeof event.delta === "string") {
                accumulatedText += event.delta;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              } else if (event.type === "error" && event.code) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? {
                          ...msg,
                          error:
                            event.code === "rate_limited"
                              ? "rate_limited"
                              : "unavailable",
                        }
                      : msg
                  )
                );
              }
            } catch {
              // Ignore partial JSON lines
            }
          }
        }

        // Flush any remaining buffer line
        if (buffer.trim()) {
          try {
            const event = JSON.parse(buffer.trim());
            if (event.type === "text" && typeof event.delta === "string") {
              accumulatedText += event.delta;
            } else if (event.type === "slots") {
              hasSlots = (event.slots && event.slots.length > 0) || (event.alternatives && event.alternatives.length > 0);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId
                    ? {
                        ...msg,
                        slots: event.slots ?? [],
                        alternatives: event.alternatives ?? [],
                      }
                    : msg
                )
              );
            }
          } catch {
            // ignore
          }
        }

        // Final booking intent check
        const isBooking = checkBookingIntent(accumulatedText, trimmed);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: accumulatedText,
                  isBookingIntent: isBooking && !hasSlots,
                }
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
      setMessages((prev) => prev.filter((m) => !m.error));
      sendMessage(lastUserPromptRef.current);
    }
  };

  // Slot booking interactions
  const handleSelectSlot = (msgId: string, slot: Slot) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId
          ? { ...msg, selectedSlot: slot, slotTakenNotice: null }
          : msg
      )
    );
  };

  const handleBackFromBooking = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, selectedSlot: null } : msg
      )
    );
  };

  const handleBookingSuccess = (
    msgId: string,
    confirmed: AppointmentConfirmed
  ) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId
          ? {
              ...msg,
              selectedSlot: null,
              confirmedAppointment: confirmed,
              slotTakenNotice: null,
            }
          : msg
      )
    );
  };

  const handleSlotTaken = (
    msgId: string,
    freshSlots?: Slot[],
    freshAlts?: Slot[]
  ) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId
          ? {
              ...msg,
              selectedSlot: null,
              slots: freshSlots !== undefined ? freshSlots : msg.slots,
              alternatives:
                freshAlts !== undefined ? freshAlts : msg.alternatives,
              slotTakenNotice:
                "That time was just booked by someone else. Please choose another time from the updated list:",
            }
          : msg
      )
    );
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
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-7rem)] bg-paper border border-line rounded-2xl shadow-xl flex flex-col overflow-hidden transition-all duration-200 origin-bottom-right motion-reduce:transition-none ${
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
              I answer questions about the clinic and help check appointment
              times. I&apos;m an AI, not a dentist.
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
          onSelectSlot={handleSelectSlot}
          onBackFromBooking={handleBackFromBooking}
          onBookingSuccess={handleBookingSuccess}
          onSlotTaken={handleSlotTaken}
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
              placeholder="Ask a question or request a time..."
              className="w-full resize-none bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none max-h-24"
            />
            <div className="flex items-center gap-2 pr-2">
              <span
                className={`text-[10px] tabular-nums font-mono ${
                  input.length >= MAX_CHARS
                    ? "text-clay font-medium"
                    : "text-ink-soft/80"
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
