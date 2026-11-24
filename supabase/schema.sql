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

-- ---------------------------------------------------------------------------
-- Booking: doctors, working hours, appointments
-- ---------------------------------------------------------------------------
create extension if not exists btree_gist;

create table if not exists doctors (
  id text primary key,            -- slug, e.g. 'dr-a'
  name text not null,
  role text not null,
  email text not null,            -- placeholder, example.com
  active boolean default true
);

create table if not exists working_hours (
  doctor_id text references doctors(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),   -- 0 = Sunday
  start_time time not null,
  end_time time not null
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id text not null references doctors(id),
  patient_name text not null,
  patient_email text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'booked' check (status in ('booked','cancelled')),
  created_at timestamptz default now(),
  constraint no_double_booking exclude using gist (
    doctor_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status = 'booked')
);

alter table doctors enable row level security;
alter table working_hours enable row level security;
alter table appointments enable row level security;
-- no policies: all access goes through the server with the service role key

