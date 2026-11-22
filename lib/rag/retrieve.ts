/**
 * lib/rag/retrieve.ts
 *
 * Retrieve top-k knowledge chunks by cosine similarity.
 */

import { db } from "@/lib/db";
import { embed } from "@/lib/rag/embed";
import localChunks from "./local-kb-chunks.json";

export interface KbChunk {
  id: number;
  source: string;
  heading: string;
  content: string;
  similarity: number;
}

const SIMILARITY_THRESHOLD = 0.55;
const TOP_K = 4;

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function retrieveLocal(queryEmbedding: number[]): KbChunk[] {
  const scored = (localChunks as Array<{
    id: number;
    source: string;
    heading: string;
    content: string;
    embedding: number[];
  }>)
    .map((chunk) => ({
      id: chunk.id,
      source: chunk.source,
      heading: chunk.heading,
      content: chunk.content,
      similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .filter((c) => c.similarity >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, TOP_K);

  return scored;
}

export async function retrieve(query: string): Promise<KbChunk[]> {
  const embedding = await embed(query);

  try {
    const { data, error } = await db().rpc("match_kb_chunks", {
      query_embedding: embedding,
      match_count: TOP_K,
      similarity_threshold: SIMILARITY_THRESHOLD,
    });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data as KbChunk[];
    }
  } catch {
    // If Supabase RPC is unavailable or table not created, fall back to local chunks
  }

  return retrieveLocal(embedding);
}
