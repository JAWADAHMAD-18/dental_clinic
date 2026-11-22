/**
 * app/api/enquiry/route.ts
 *
 * POST /api/enquiry
 *
 * Request:  { name, contact, preferredTime, reason, note?, consent: true, website: "" }
 * Response: { ok: true, preview: { subject, body, name, contact, preferredTime, reason, note, timestamp } }
 *
 * Rules:
 *  - Zod validation; honeypot check (website must be empty).
 *  - Upstash IP rate limiting: 3 per IP per hour.
 *  - Insert into enquiries table (Supabase with local fallback).
 *  - Send notification email to DEMO_INBOX_EMAIL via Brevo SMTP or Resend.
 *  - Never log message content.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { enquiryIpLimiter } from "@/lib/ratelimit";
import { sendEnquiryEmail } from "@/lib/email";
import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Helpers & Validation Schema
// ---------------------------------------------------------------------------

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

const EnquiryRequestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  contact: z.string().trim().min(5).max(100),
  preferredTime: z.string().trim().min(1).max(50),
  reason: z.string().trim().min(1).max(100),
  note: z.string().trim().max(200).optional().default(""),
  consent: z.literal(true),
  website: z.string().max(0), // Honeypot: must be empty
});

// Local fallback file to record enquiries if Supabase table is not yet migrated
const LOCAL_ENQUIRIES_PATH = path.join(process.cwd(), "data", "enquiries.json");

function saveLocalEnquiry(enquiry: {
  id: string;
  name: string;
  contact: string;
  preferred_time: string;
  reason: string;
  note: string | null;
  created_at: string;
}) {
  try {
    const dir = path.dirname(LOCAL_ENQUIRIES_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    let existing: unknown[] = [];
    if (fs.existsSync(LOCAL_ENQUIRIES_PATH)) {
      try {
        existing = JSON.parse(fs.readFileSync(LOCAL_ENQUIRIES_PATH, "utf8"));
      } catch {
        existing = [];
      }
    }
    existing.push(enquiry);
    fs.writeFileSync(LOCAL_ENQUIRIES_PATH, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.error("[enquiry] Local storage write error:", err);
  }
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // ── 1. Rate Limiting (3 per IP per hour) ──────────────────────────────────
  const ip = getIp(req);
  try {
    const limitResult = await enquiryIpLimiter().limit(ip);
    if (!limitResult.success) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  } catch {
    // Upstash unavailable — fail open (do not block legit visitors, but log event)
    console.error("[enquiry] Rate limit check failed — failing open");
  }

  // ── 2. Body Validation & Honeypot Check ────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = EnquiryRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const data = parsed.data;

  // ── 3. Insert into Database ───────────────────────────────────────────────
  const now = new Date();
  const timestampStr = now.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const row = {
    name: data.name,
    contact: data.contact,
    preferred_time: data.preferredTime.toLowerCase(),
    reason: data.reason,
    note: data.note || null,
  };

  try {
    const { error: insertError } = await db().from("enquiries").insert(row);
    if (insertError) {
      console.error("[enquiry] Supabase insert error code:", insertError.code);
      // Fallback: save to local json file
      saveLocalEnquiry({
        id: `local-${Date.now()}`,
        ...row,
        created_at: now.toISOString(),
      });
    }
  } catch {
    console.error("[enquiry] Database connection failed — saving locally");
    saveLocalEnquiry({
      id: `local-${Date.now()}`,
      ...row,
      created_at: now.toISOString(),
    });
  }

  // ── 4. Send Notification Email ───────────────────────────────────────────
  let emailResult = {
    subject: `New website enquiry: ${data.reason}`,
    body: `Patient Name: ${data.name}\nContact: ${data.contact}\nPreferred Time: ${data.preferredTime}\nReason: ${data.reason}${data.note ? `\nNote: ${data.note}` : ""}`,
  };

  try {
    emailResult = await sendEnquiryEmail({
      name: data.name,
      contact: data.contact,
      preferredTime: data.preferredTime,
      reason: data.reason,
      note: data.note || undefined,
    });
  } catch {
    console.error("[enquiry] Failed to dispatch notification email");
  }

  // ── 5. Return Preview Payload ─────────────────────────────────────────────
  return NextResponse.json({
    ok: true,
    preview: {
      subject: emailResult.subject,
      body: emailResult.body,
      name: data.name,
      contact: data.contact,
      preferredTime: data.preferredTime,
      reason: data.reason,
      note: data.note || undefined,
      timestamp: timestampStr,
    },
  });
}
