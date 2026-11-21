-- Alder & Finch Dental — Supabase schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query → paste → Run).
-- Embedding dimension: 1536 (OpenAI text-embedding-3-small).

create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- Knowledge base chunks
-- ---------------------------------------------------------------------------
create table if not exists kb_chunks (
  id          bigserial primary key,
  source      text        not null,  -- file name, e.g. "about-the-clinic.md"
  heading     text        not null,  -- the ## heading that opened this chunk
  content     text        not null,  -- full chunk text (heading + body)
  embedding   vector(1536) not null,
  created_at  timestamptz  not null default now()
);

create index if not exists kb_chunks_embedding_idx
  on kb_chunks using hnsw (embedding vector_cosine_ops);

-- ---------------------------------------------------------------------------
-- Enquiries
-- ---------------------------------------------------------------------------
create table if not exists enquiries (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  contact         text        not null,  -- phone or email
  preferred_time  text        not null,  -- morning | afternoon | evening | after-hours
  reason          text        not null,  -- one of the service names
  note            text,                  -- max 200 chars; no medical details
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row-level security (all access via service role key; no policies)
-- ---------------------------------------------------------------------------
alter table kb_chunks  enable row level security;
alter table enquiries  enable row level security;

-- ---------------------------------------------------------------------------
-- Similarity search function
-- ---------------------------------------------------------------------------
create or replace function match_kb_chunks(
  query_embedding vector(1536),
  match_count     int default 4,
  similarity_threshold float default 0.5
)
returns table (
  id          bigint,
  source      text,
  heading     text,
  content     text,
  similarity  float
)
language sql stable
as $$
  select
    id,
    source,
    heading,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from kb_chunks
  where 1 - (embedding <=> query_embedding) >= similarity_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
