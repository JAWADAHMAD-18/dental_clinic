/**
 * scripts/ingest.ts
 *
 * Chunk content/knowledge/*.md by ## heading, embed each chunk,
 * and upsert into the kb_chunks table (clear then re-insert on each run).
 *
 * Usage:
 *   npx tsx scripts/ingest.ts
 *
 * Required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, EMBEDDING_API_KEY
 * Load them from .env.local or export them before running.
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Env — load .env.local manually so tsx doesn't need dotenv as a dep.
// ---------------------------------------------------------------------------
function loadEnvLocal() {
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && !(key in process.env)) process.env[key] = val;
    }
  } catch {
    // .env.local is optional when env vars are already set
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const EMBEDDING_API_KEY = process.env.EMBEDDING_API_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !EMBEDDING_API_KEY) {
  console.error(
    "Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, EMBEDDING_API_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// Embedding
// ---------------------------------------------------------------------------
async function embed(text: string): Promise<number[]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${EMBEDDING_API_KEY}`,
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Embedding API ${res.status}: ${body}`);
  }
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data[0].embedding;
}

// ---------------------------------------------------------------------------
// Chunking — split a markdown file into chunks by ## heading
// ---------------------------------------------------------------------------
interface Chunk {
  source: string;
  heading: string;
  content: string;
}

function chunkMarkdown(filename: string, text: string): Chunk[] {
  const lines = text.split("\n");
  const chunks: Chunk[] = [];
  let currentHeading = "";
  let currentLines: string[] = [];

  function flush() {
    const body = currentLines.join("\n").trim();
    if (currentHeading && body) {
      chunks.push({
        source: filename,
        heading: currentHeading,
        content: `${currentHeading}\n${body}`,
      });
    }
  }

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flush();
      currentHeading = line.slice(3).trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  flush();
  return chunks;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const knowledgeDir = join(process.cwd(), "content", "knowledge");
  const files = readdirSync(knowledgeDir).filter((f) => f.endsWith(".md"));

  const allChunks: Chunk[] = [];
  for (const file of files) {
    const text = readFileSync(join(knowledgeDir, file), "utf8");
    const chunks = chunkMarkdown(file, text);
    allChunks.push(...chunks);
    console.log(`  ${file}: ${chunks.length} chunk(s)`);
  }

  console.log(`\nTotal chunks: ${allChunks.length}`);
  console.log("Clearing existing kb_chunks...");

  const { error: delError } = await supabase
    .from("kb_chunks")
    .delete()
    .neq("id", 0); // delete all rows
  if (delError) {
    console.error("Delete failed:", delError.message);
    process.exit(1);
  }

  console.log("Embedding and inserting chunks...");
  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    process.stdout.write(`  [${i + 1}/${allChunks.length}] ${chunk.heading}...`);
    const embedding = await embed(chunk.content);
    const { error } = await supabase.from("kb_chunks").insert({
      source: chunk.source,
      heading: chunk.heading,
      content: chunk.content,
      embedding,
    });
    if (error) {
      console.error(`\nInsert failed for "${chunk.heading}":`, error.message);
      process.exit(1);
    }
    console.log(" ✓");
  }

  console.log("\n✅ Ingest complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
