/**
 * app/api/chat/route.ts
 *
 * POST /api/chat
 *
 * Request:  { messages: [{ role: "user"|"assistant", content: string }] }
 *           Max 8 messages, each max 500 chars.
 *
 * Response (success): NDJSON stream, Content-Type: application/x-ndjson
 *   Each line is a JSON object (one of):
 *     { "type": "text",    "delta": "..."               }
 *     { "type": "sources", "headings": [...]            }
 *     { "type": "slots",   "slots": [...], "alternatives": [...] }
 *     { "type": "error",   "code": "rate_limited"|"unavailable"|"bad_request" }
 *     { "type": "done"                                  }
 *
 * Response (pre-stream error): JSON { error: "..." } with status 429|400|503
 *
 * Rules:
 *  - Validate with Zod; sanitise control characters.
 *  - Rate-limit by IP (20/hr) and globally (500/day) via Upstash.
 *  - Retrieve top-4 chunks; if latest user message is very short (<= 8 chars)
 *    prepend previous user message to widen the query.
 *  - Build system prompt via lib/rag/prompt.ts (includes current Sydney time).
 *  - Tool calling: show_availability — non-streaming first pass, then stream.
 *  - Stream from Groq; max 350 output tokens.
 *  - Never log message content.
 */

import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import Groq from "groq-sdk";
import { ChatRequestSchema, sanitise } from "@/lib/rag/guard";
import { retrieve } from "@/lib/rag/retrieve";
import { buildSystemPrompt } from "@/lib/rag/prompt";
import { chatIpLimiter, chatGlobalLimiter } from "@/lib/ratelimit";
import { getAvailability } from "@/lib/booking/slots";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

const LOCAL_APPOINTMENTS_PATH = path.join(
  process.cwd(),
  "data",
  "appointments.json"
);

function getLocalAppointments(): Array<{
  doctor_id: string;
  starts_at: string;
  ends_at: string;
  status: "booked" | "cancelled";
}> {
  try {
    if (fs.existsSync(LOCAL_APPOINTMENTS_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_APPOINTMENTS_PATH, "utf8"));
    }
  } catch {
    // ignore
  }
  return [];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function errorResponse(
  code: "rate_limited" | "bad_request" | "unavailable",
  status: number
): Response {
  return new Response(JSON.stringify({ error: code }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function ndjsonLine(obj: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

// Short query threshold: widen retrieval query if latest message is this short.
const SHORT_QUERY_CHARS = 8;

// Pick the Groq model from env or fall back to a known fast model.
const GROQ_MODEL = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

// ---------------------------------------------------------------------------
// Tool definition
// ---------------------------------------------------------------------------

const SHOW_AVAILABILITY_TOOL: Groq.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "show_availability",
    description:
      "Returns real available appointment slots from the clinic's schedule. " +
      "Call this for ANY request about appointment times, availability, booking, " +
      "or scheduling. Never state a time that this tool did not return.",
    parameters: {
      type: "object" as const,
      properties: {
        date: {
          type: "string",
          description:
            "The date to check in YYYY-MM-DD format (Australia/Sydney timezone).",
        },
        time_of_day: {
          type: "string",
          enum: ["morning", "afternoon", "evening"],
          description:
            "Optional filter: morning (before noon), afternoon (noon–5 pm), evening (5 pm+).",
        },
        doctor_id: {
          type: "string",
          description:
            "Optional doctor slug, e.g. 'dr-a'. Omit to show all available doctors.",
        },
      },
      required: ["date"],
    },
  },
};

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<Response> {
  // ── 1. Rate limits ──────────────────────────────────────────────────────
  const ip = getIp(req);

  let ipLimitOk = true;
  let globalLimitOk = true;

  try {
    const [ipResult, globalResult] = await Promise.all([
      chatIpLimiter().limit(ip),
      chatGlobalLimiter().limit("global"),
    ]);
    ipLimitOk = ipResult.success;
    globalLimitOk = globalResult.success;
  } catch {
    // Upstash unavailable — fail open (allow the request)
    console.error("[chat] rate-limit check failed — failing open");
  }

  if (!ipLimitOk) return errorResponse("rate_limited", 429);
  if (!globalLimitOk) return errorResponse("unavailable", 503);

  // ── 2. Parse & validate body ────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("bad_request", 400);
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("bad_request", 400);

  // Sanitise every message in place.
  const messages = parsed.data.messages.map((m) => ({
    role: m.role,
    content: sanitise(m.content),
  }));

  // Last message must come from the user.
  const lastMsg = messages[messages.length - 1];
  if (lastMsg.role !== "user") return errorResponse("bad_request", 400);

  // ── 3. Build retrieval query ─────────────────────────────────────────────
  let query = lastMsg.content;

  if (query.trim().length <= SHORT_QUERY_CHARS) {
    const prevUser = [...messages]
      .slice(0, -1)
      .reverse()
      .find((m) => m.role === "user");
    if (prevUser) {
      query = `${prevUser.content} ${query}`.trim();
    }
  }

  // ── 4. Retrieve knowledge chunks ─────────────────────────────────────────
  let chunks: Awaited<ReturnType<typeof retrieve>> = [];
  try {
    chunks = await retrieve(query);
  } catch {
    console.error("[chat] retrieval failed — proceeding with empty context");
  }

  const chunkHeadings = chunks.map((c) => c.heading);
  const contextText =
    chunks.length > 0
      ? chunks.map((c) => `### ${c.heading}\n${c.content}`).join("\n\n")
      : "";

  // ── 5. Build system prompt (includes current Sydney date/time) ───────────
  const systemPrompt = buildSystemPrompt(contextText);

  // ── 6. Validate Groq key ─────────────────────────────────────────────────
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) return errorResponse("unavailable", 503);

  const groq = new Groq({ apiKey });

  // Build the Groq message array (typed for Groq SDK)
  type GroqMessage = Groq.Chat.Completions.ChatCompletionMessageParam;

  const groqMessages: GroqMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // ── 7. Build NDJSON stream ───────────────────────────────────────────────
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (obj: Record<string, unknown>) =>
        controller.enqueue(ndjsonLine(obj));

      try {
        // Emit sources event (even if empty — UI uses it)
        enqueue({ type: "sources", headings: chunkHeadings });

        // ── 7a. First pass: non-streaming with tool calling ────────────────
        let firstResponse: Groq.Chat.Completions.ChatCompletion;
        try {
          firstResponse = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: groqMessages,
            max_tokens: 300,
            temperature: 0.3,
            tools: [SHOW_AVAILABILITY_TOOL],
            tool_choice: "auto",
            stream: false,
          });
        } catch (err) {
          console.error("[chat] Groq first-pass failed:", err);
          enqueue({ type: "error", code: "unavailable" });
          enqueue({ type: "done" });
          controller.close();
          return;
        }

        const firstChoice = firstResponse.choices[0];
        const toolCalls = firstChoice?.message?.tool_calls;

        if (toolCalls && toolCalls.length > 0) {
          // ── 7b. Tool call path ───────────────────────────────────────────
          const toolCall = toolCalls[0];
          let toolResult: Record<string, unknown> = { slots: [] };

          if (toolCall.function.name === "show_availability") {
            try {
              const args = JSON.parse(toolCall.function.arguments) as {
                date?: string;
                time_of_day?: "morning" | "afternoon" | "evening";
                doctor_id?: string;
              };

              // Fetch booked appointments from DB for accurate slot generation
              let bookedAppointments: Array<{
                doctor_id: string;
                starts_at: string;
                ends_at: string;
                status: "booked" | "cancelled";
              }> = [];

              try {
                const { data, error } = await db()
                  .from("appointments")
                  .select("doctor_id,starts_at,ends_at,status")
                  .eq("status", "booked")
                  .gte("starts_at", new Date().toISOString());
                if (error) {
                  bookedAppointments = getLocalAppointments();
                } else {
                  bookedAppointments = (data ?? []) as typeof bookedAppointments;
                }
              } catch {
                bookedAppointments = getLocalAppointments();
              }

              const availability = getAvailability(
                {
                  date: args.date ?? new Date().toISOString().slice(0, 10),
                  time_of_day: args.time_of_day,
                  doctor_id: args.doctor_id,
                },
                { appointments: bookedAppointments }
              );

              toolResult = {
                slots: availability.slots,
                nearest_alternatives: availability.nearest_alternatives ?? [],
              };

              // Emit slots event for the UI
              enqueue({
                type: "slots",
                slots: availability.slots,
                alternatives: availability.nearest_alternatives ?? [],
              });
            } catch {
              console.error("[chat] show_availability execution failed");
              toolResult = { slots: [], error: "Could not fetch availability" };
            }
          }

          // Build messages for the second (streaming) pass
          const messagesWithTool: GroqMessage[] = [
            ...groqMessages,
            {
              role: "assistant",
              content: firstChoice.message.content ?? null,
              tool_calls: toolCalls,
            },
            {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            },
          ];

          // ── 7c. Second pass: streaming with tool result ──────────────────
          let groqStream: AsyncIterable<Groq.Chat.ChatCompletionChunk>;
          try {
            groqStream = await groq.chat.completions.create({
              model: GROQ_MODEL,
              messages: messagesWithTool,
              max_tokens: 300,
              temperature: 0.3,
              stream: true,
            });
          } catch {
            console.error("[chat] Groq streaming second pass failed");
            enqueue({ type: "error", code: "unavailable" });
            enqueue({ type: "done" });
            controller.close();
            return;
          }

          for await (const chunk of groqStream) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) enqueue({ type: "text", delta });
          }
        } else {
          // ── 7d. No tool call — stream the first response text ────────────
          // If the model already returned content, stream it character-by-character
          // as a single text event (first pass was non-streaming).
          const text = firstChoice?.message?.content ?? "";
          if (text) {
            // Stream in small chunks so the UI shows progressive rendering
            const chunkSize = 20;
            for (let i = 0; i < text.length; i += chunkSize) {
              enqueue({ type: "text", delta: text.slice(i, i + chunkSize) });
            }
          } else {
            // Re-call with streaming so we get a proper streamed response
            let groqStream: AsyncIterable<Groq.Chat.ChatCompletionChunk>;
            try {
              groqStream = await groq.chat.completions.create({
                model: GROQ_MODEL,
                messages: groqMessages,
                max_tokens: 300,
                temperature: 0.3,
                stream: true,
              });
            } catch {
              console.error("[chat] Groq streaming fallback failed");
              enqueue({ type: "error", code: "unavailable" });
              enqueue({ type: "done" });
              controller.close();
              return;
            }
            for await (const chunk of groqStream) {
              const delta = chunk.choices[0]?.delta?.content ?? "";
              if (delta) enqueue({ type: "text", delta });
            }
          }
        }

        enqueue({ type: "done" });
      } catch {
        console.error("[chat] Stream handler error");
        try {
          controller.enqueue(
            ndjsonLine({ type: "error", code: "unavailable" })
          );
          controller.enqueue(ndjsonLine({ type: "done" }));
        } catch {
          // controller may already be closed
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-store",
    },
  });
}
