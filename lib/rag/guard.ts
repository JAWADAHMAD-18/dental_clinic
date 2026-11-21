/**
 * lib/rag/guard.ts
 *
 * Input guard helpers — strip dangerous characters, validate structure.
 */

import { z } from "zod";

/** Strip null bytes and other control characters (keep newlines/tabs). */
export function sanitise(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(500),
});

export const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(8),
});

export type ChatMessage = z.infer<typeof MessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
