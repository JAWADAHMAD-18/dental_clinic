/**
 * lib/rag/retrieve.ts
 *
 * Retrieve top-k knowledge chunks by cosine similarity.
 */

import { db } from "@/lib/db";
import { embed } from "@/lib/rag/embed";

export interface KbChunk {
  id: number;
  source: string;
  heading: string;
  content: string;
  similarity: number;
}

const SIMILARITY_THRESHOLD = 0.5;
const TOP_K = 4;

export async function retrieve(query: string): Promise<KbChunk[]> {
  const embedding = await embed(query);

  const { data, error } = await db().rpc("match_kb_chunks", {
    query_embedding: embedding,
    match_count: TOP_K,
    similarity_threshold: SIMILARITY_THRESHOLD,
  });

  if (error) throw new Error(`Retrieval error: ${error.message}`);

  return (data ?? []) as KbChunk[];
}
