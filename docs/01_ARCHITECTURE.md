# Architecture

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) | SEO-ready pages, streaming route handlers, one deploy |
| Styling | Tailwind CSS + shadcn/ui (Radix) | Fast, accessible primitives |
| Motion | `motion` (Framer Motion) with `LazyMotion` | Small bundle, below-the-fold reveals |
| Icons | lucide-react | Light |
| Database | Supabase Postgres + pgvector | One DB for enquiries and vectors, free tier |
| LLM | Groq (current Llama-family chat model; pick from the console) | Fast streaming, free tier |
| Embeddings | One provider, wrapped in `lib/rag/embed.ts` | Groq does not serve embeddings; reuse whatever Aiza uses so the vector dimension is known |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) | In-memory limits do not work on serverless |
| Email (enquiry notification to own inbox) | Brevo SMTP (transactional, to our own address) or Resend | Powers the mock "what the clinic receives" demo |
| Hosting | Vercel, domain `demo.zalvrohq.com` | CNAME from Cloudflare |
| Validation | zod | Input safety on every route |

No separate backend server. All server logic lives in Next.js route handlers / server actions.

## Folder layout

```
app/
  (site)/page.tsx, services/, fees/, about/, contact/, privacy/
  api/chat/route.ts
  api/enquiry/route.ts
  robots.ts
components/
  layout/ (SampleStrip, TopBar, Navbar, Footer)
  sections/ (Hero, ServicesGrid, Process, TeamPreview, FeesTable, Faq, CtaBand, MapEmbed)
  chat/ (ChatWidget, MessageList, SuggestedQuestions)
  enquiry/ (EnquiryForm, ClinicInboxPreview)
  ui/ (shadcn)
content/
  clinic.ts          single source of truth for clinic facts
  knowledge/         markdown files (see 04_KNOWLEDGE_BASE.md)
lib/
  rag/ (embed.ts, retrieve.ts, prompt.ts, guard.ts)
  db.ts, ratelimit.ts, email.ts, env.ts
scripts/
  ingest.ts          chunk + embed + upsert knowledge base
```

## Data model

```sql
create extension if not exists vector;

create table kb_chunks (
  id bigserial primary key,
  source text not null,          -- file name
  heading text not null,
  content text not null,
  embedding vector(<DIM>) not null,   -- set DIM to the embedding model's dimension
  created_at timestamptz default now()
);
create index on kb_chunks using hnsw (embedding vector_cosine_ops);

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,         -- phone or email
  preferred_time text not null,  -- enum: morning | afternoon | evening | after-hours
  reason text not null,          -- one of the service names
  note text,                     -- max 200 chars, no medical details
  created_at timestamptz default now()
);
```

Enquiry retention: delete rows older than 7 days (scheduled job or manual cleanup script). Document in the privacy page.

## API contract

`POST /api/chat`
- Request: `{ "messages": [{ "role": "user" | "assistant", "content": string }] }` (max last 8 messages, each max 500 chars)
- Response: streamed plain text
- Errors: JSON `{ "error": "rate_limited" | "bad_request" | "unavailable" }` with matching status; the UI shows a friendly message for each.

`POST /api/enquiry`
- Request: `{ name, contact, preferredTime, reason, note?, consent: true, website: "" }` (`website` is a honeypot, must be empty)
- Response: `{ ok: true, preview: { subject, body } }` (the preview feeds the mock clinic-inbox panel)

Both routes: validate with zod, rate limit by IP, return generic errors, never log message content.

## Limits (starting values)

- Chat: 20 messages per IP per hour, 30 per session, 500 chars per message, max 350 output tokens, global cap 500 messages per day (then show a polite "demo is resting, call us" state).
- Enquiry: 3 per IP per hour.

## Environment variables

`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `GROQ_API_KEY`, `EMBEDDING_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SMTP_*` or `RESEND_API_KEY`, `DEMO_INBOX_EMAIL`, `NEXT_PUBLIC_SITE_URL`. Keep all secrets server-side. Provide `.env.example` without values.

## Deployment

1. Create Vercel project from the repo, add env vars.
2. Add `demo.zalvrohq.com` in Vercel Domains. Vercel shows the exact DNS record to create (usually a CNAME to `cname.vercel-dns.com`).
3. In Cloudflare DNS add that CNAME for `demo`, set to DNS only (grey cloud) first.
4. Run `scripts/ingest.ts` against the production DB.
5. Verify noindex headers and the sample strip on every page.

## Fallback plan

If by the end of Day 2 the chatbot does not pass the scenario tests in 06_TASKS.md, switch to the existing Aiza backend (Express + LangChain + Groq + Qdrant, hosted on Render) behind the same `/api/chat` contract, with only the knowledge base swapped. Add a warm-up ping on page load so a cold start does not stall the chat. Do not extend the deadline to finish the pgvector build.
