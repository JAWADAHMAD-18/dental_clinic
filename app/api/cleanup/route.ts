/**
 * app/api/cleanup/route.ts
 *
 * GET /api/cleanup
 *
 * Called daily by the Vercel cron job (vercel.json).
 * Deletes enquiries and appointments older than 7 days.
 * Returns a plain JSON summary — no sensitive data logged or returned.
 */

import { NextRequest } from "next/server";
import { db } from "@/lib/db";

const RETENTION_DAYS = 7;

export async function GET(req: NextRequest): Promise<Response> {
  // Optional: guard with CRON_SECRET so only Vercel can trigger it
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cutoff = new Date(
    Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  let enquiriesDeleted = 0;
  let appointmentsDeleted = 0;

  try {
    const [enquiryResult, appointmentResult] = await Promise.all([
      db()
        .from("enquiries")
        .delete({ count: "exact" })
        .lt("created_at", cutoff),
      db()
        .from("appointments")
        .delete({ count: "exact" })
        .lt("created_at", cutoff),
    ]);

    if (!enquiryResult.error) enquiriesDeleted = enquiryResult.count ?? 0;
    if (!appointmentResult.error)
      appointmentsDeleted = appointmentResult.count ?? 0;
  } catch {
    console.error("[cleanup] DB error during retention cleanup");
    return new Response(JSON.stringify({ error: "unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log(
    `[cleanup] Removed ${enquiriesDeleted} enquiries, ${appointmentsDeleted} appointments older than ${RETENTION_DAYS} days`
  );

  return new Response(
    JSON.stringify({
      ok: true,
      deleted: { enquiries: enquiriesDeleted, appointments: appointmentsDeleted },
      cutoff,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    }
  );
}
