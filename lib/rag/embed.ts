/**
 * lib/rag/embed.ts
 *
 * Single embedding provider behind one function.
 * Provider: OpenAI text-embedding-3-small (1536 dimensions).
 * EMBEDDING_API_KEY must be set to your OpenAI API key.
 */

import { env } from "@/lib/env";

const OPENAI_EMBEDDING_URL = "https://api.openai.com/v1/embeddings";
const OPENAI_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIM = 1536;

export async function embed(text: string): Promise<number[]> {
  const key = env.EMBEDDING_API_KEY;
  if (!key) throw new Error("EMBEDDING_API_KEY is not set");

  // Google Gemini embedding key (starts with AQ. or AIza)
  if (key.startsWith("AQ.") || key.startsWith("AIza")) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { parts: [{ text }] } }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gemini Embedding API error ${res.status}: ${body}`);
    }

    const json = (await res.json()) as {
      embedding?: { values: number[] };
    };

    if (!json.embedding?.values) {
      throw new Error("No embedding values returned from Gemini API");
    }

    return json.embedding.values;
  }

  // Default: OpenAI text-embedding-3-small
  const res = await fetch(OPENAI_EMBEDDING_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model: OPENAI_MODEL, input: text }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Embedding API error ${res.status}: ${body}`);
  }

  const json = (await res.json()) as {
    data: { embedding: number[] }[];
  };

  return json.data[0].embedding;
}
