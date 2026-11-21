/**
 * lib/rag/embed.ts
 *
 * Single embedding provider behind one function.
 * Provider: OpenAI text-embedding-3-small (1536 dimensions).
 * EMBEDDING_API_KEY must be set to your OpenAI API key.
 */

import { env } from "@/lib/env";

const EMBEDDING_URL =
  "https://api.openai.com/v1/embeddings";
const MODEL = "text-embedding-3-small";
export const EMBEDDING_DIM = 1536;

export async function embed(text: string): Promise<number[]> {
  const key = env.EMBEDDING_API_KEY;
  if (!key) throw new Error("EMBEDDING_API_KEY is not set");

  const res = await fetch(EMBEDDING_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model: MODEL, input: text }),
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
