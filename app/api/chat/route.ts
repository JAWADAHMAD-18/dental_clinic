/**
 * app/api/chat/route.ts
 *
 * POST /api/chat
 *
 * Request:  { messages: [{ role: "user"|"assistant", content: string }] }
 *           Max 8 messages, each max 500 chars.
 *
 * Response (success): streamed plain text with two custom response headers:
 *   X-Based-On: comma-separated chunk headings (empty string if none)
 *
 * Response (error): JSON { error: "rate_limited" | "bad_request" | "unavailable" }
 *   with status 429 | 400 | 503
 *
 * Rules:
 *  - Validate with Zod; sanitise control characters.
 *  - Rate-limit by IP (20/hr) and globally (500/day) via Upstash.
 *  - Retrieve top-4 chunks; if latest user message is very short (<= 8 chars)
 *    prepend previous user message to widen the query.
 *  - Build system prompt via lib/rag/prompt.ts.
 *  - Stream from Groq; max 350 output tokens.
 *  - Never log message content.
 */

import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { ChatRequestSchema, sanitise } from "@/lib/rag/guard";
import { retrieve } from "@/lib/rag/retrieve";
import { buildSystemPrompt } from "@/lib/rag/prompt";
import { chatIpLimiter, chatGlobalLimiter } from "@/lib/ratelimit";
import { env } from "@/lib/env";

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

// Short query threshold: if the latest user message is this short we append
// the previous user message before embedding so retrieval is more accurate.
const SHORT_QUERY_CHARS = 8;

// Pick the Groq model from env or fall back to a known fast model.
const GROQ_MODEL = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

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
    // Upstash unavailable — fail open (allow the request but log the count failure)
    // We intentionally do NOT log content; just the event type.
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
    // Find the previous user message to widen the query.
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
    // Retrieval failure — continue with empty context rather than 503,
    // so the model can still produce the "I don't have that info" answer.
    console.error("[chat] retrieval failed — proceeding with empty context");
  }

  const chunkHeadings = chunks.map((c) => c.heading);
  const contextText =
    chunks.length > 0
      ? chunks.map((c) => `### ${c.heading}\n${c.content}`).join("\n\n")
      : "";

  // ── 5. Build Groq messages ───────────────────────────────────────────────
  const systemPrompt = buildSystemPrompt(contextText);

  const groqMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // ── 6. Stream from Groq ──────────────────────────────────────────────────
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) return errorResponse("unavailable", 503);

  const groq = new Groq({ apiKey });

  let groqStream: AsyncIterable<Groq.Chat.ChatCompletionChunk>;
  try {
    groqStream = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: groqMessages,
      max_tokens: 350,
      stream: true,
      temperature: 0.3,
    });
  } catch {
    console.error("[chat] Groq stream creation failed");
    return errorResponse("unavailable", 503);
  }

  // ── 7. Pipe the stream back ──────────────────────────────────────────────
  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of groqStream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch {
        console.error("[chat] Groq stream read error");
        controller.error("stream error");
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-store",
      // Chunk headings for the UI "Based on" line (empty string if none matched).
      "X-Based-On": chunkHeadings.join(", "),
    },
  });
}
