# Alder & Finch Dental: Sample Clinic Website (by Zalvro)

A premium, reusable sample dental-clinic website with a source-grounded AI assistant. It exists to show clinics what Zalvro can build. It is NOT a real clinic and must never be mistaken for one.

Target market for outreach: Australian dental clinics. Build window: 3-4 days.

## Files in this pack

| File | Purpose |
|---|---|
| 00_README.md | Overview and hard rules (read first, every session) |
| 01_ARCHITECTURE.md | Stack, data model, API contract, env vars, fallback plan |
| 02_DESIGN_SYSTEM.md | Colours, type, layout, motion, imagery |
| 03_CHATBOT_SPEC.md | Assistant behaviour, prompt, retrieval, safety, limits |
| 04_KNOWLEDGE_BASE.md | The clinic's placeholder facts the chatbot retrieves from |
| 05_SITE_CONTENT.md | Page-by-page copy and structure |
| 06_TASKS.md | Day-by-day plan, definition of done, test checklist |

## Hard rules (apply to every change)

1. **Data-driven and reusable.** All clinic facts (name, address, phone, email, hours, services, fees, team, FAQs) live in one typed file: `content/clinic.ts`. Components only read from it. Swapping to another clinic = edit that file + the knowledge base. No clinic facts hard-coded in components.
2. **No dummy code.** No lorem ipsum, no TODO stubs, no unused components, no commented-out blocks. Placeholder *content* is allowed only where this pack marks it as placeholder.
3. **No gradients, anywhere.** No CSS gradients, gradient text, glows, blurred colour blobs, glassmorphism or neon. Flat colours only. No purple/blue "AI" palette.
4. **No fake proof.** No invented reviews, testimonials, star ratings, patient counts, statistics, awards, "as seen in" logos, or registration/AHPRA numbers.
5. **Honest sample labelling (non-negotiable).**
   - A thin, calm strip at the very top of every page: "Sample website designed by Zalvro. Placeholder content." linking to https://zalvrohq.com. It must look intentional, not like a warning banner.
   - Footer line repeating it.
   - Chat widget footer and enquiry form notice: "Sample assistant. Please don't enter real personal or medical information."
   - `noindex, nofollow` via metadata AND an `X-Robots-Tag` header. No sitemap. `robots.txt` disallows all.
   - The hero itself stays clean and premium; the label does its job in the strip, footer, chat and form.
6. **Placeholder contact data must not reach real people.**
   - Phone: (02) 5550 0142 (the 02 5550 xxxx range is reserved for fictional use in Australia; confirm against current ACMA guidance).
   - Email: hello@example.com (example.com is reserved).
   - Address: Level 1, 12 Example Street, Sydney NSW 2000.
   - Before launch, search the clinic name "Alder & Finch Dental" to confirm no real practice uses it; rename if one does.
7. **Performance budget.** Target 95+ on mobile PageSpeed for every page. Hero animation is CSS-only (no JS dependency for first paint). Below-the-fold motion uses Motion's `LazyMotion` with `domAnimation`. Map is click-to-load. Images via `next/image` with explicit dimensions. Fonts via `next/font`. No third-party scripts except what is listed in 01_ARCHITECTURE.md.
8. **Accessibility.** WCAG AA contrast, visible focus rings, semantic landmarks, labelled form fields, `prefers-reduced-motion` respected, chat messages in an `aria-live` region.
9. **No login, no dashboards, no auth.** Out of scope.
10. **Australian English** (colour, organisation, enquiry).
11. **No medical data collection.** Enquiry form collects only what 01_ARCHITECTURE.md lists.
12. When something is ambiguous, ask instead of guessing.

## Defaults assumed (change if you disagree)

- Stack: Next.js + Supabase Postgres (pgvector) + Groq, single deploy on Vercel, no separate backend.
- Clinic type: general and family dental.
- n8n is not used in the demo. The enquiry flow shows a mock "what the clinic receives" panel instead.
- Fallback if the chatbot is not passing tests by the end of Day 2: reuse the existing Aiza backend behind the same `/api/chat` contract (see 01_ARCHITECTURE.md).
