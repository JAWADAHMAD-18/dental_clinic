/**
 * app/api/appointments/route.ts
 *
 * POST /api/appointments
 *
 * Request:
 *   { doctorId, startsAt, name, email, consent: true, website: "" }
 *   "website" is a honeypot — must be empty string.
 *
 * Response (success, 200):
 *   { ok: true, appointment: { doctorName, startsAt, label },
 *     emailPreview: { patient: { subject, body }, doctor: { subject, body } } }
 *
 * Response (errors):
 *   400 { error: "bad_request" }   — validation failure, honeypot hit
 *   409 { error: "slot_taken" }    — exclusion constraint / slot no longer free
 *   429 { error: "rate_limited" }  — per-IP or per-email limit exceeded
 *   503 { error: "unavailable" }   — global daily cap or infrastructure error
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import {
  getAvailability,
  formatSlotLabel,
  utcToSydney,
} from "@/lib/booking/slots";
import {
  sendAppointmentEmails,
  AppointmentEmailPayload,
} from "@/lib/email";
import {
  bookingIpLimiter,
  bookingEmailLimiter,
  bookingGlobalLimiter,
} from "@/lib/ratelimit";

// ---------------------------------------------------------------------------
// Local fallback store for when Supabase table has not yet been migrated
// ---------------------------------------------------------------------------

const LOCAL_APPOINTMENTS_PATH = path.join(
  process.cwd(),
  "data",
  "appointments.json"
);

function getLocalAppointments(): Array<{
  doctor_id: string;
  starts_at: string;
  ends_at: string;
  status: "booked" | "cancelled";
}> {
  try {
    if (fs.existsSync(LOCAL_APPOINTMENTS_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_APPOINTMENTS_PATH, "utf8"));
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalAppointment(appt: {
  id: string;
  doctor_id: string;
  patient_name: string;
  patient_email: string;
  starts_at: string;
  ends_at: string;
  status: "booked" | "cancelled";
  created_at: string;
}) {
  try {
    const dir = path.dirname(LOCAL_APPOINTMENTS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const list = getLocalAppointments();
    list.push(appt);
    fs.writeFileSync(LOCAL_APPOINTMENTS_PATH, JSON.stringify(list, null, 2));
  } catch (err) {
    console.error("[appointments] Local write error:", err);
  }
}

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const AppointmentSchema = z.object({
  doctorId: z.string().min(1).max(50),
  startsAt: z.string().datetime(),
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  consent: z.literal(true),
  website: z.string().max(0), // honeypot — must be empty
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function jsonError(
  error: "bad_request" | "rate_limited" | "slot_taken" | "unavailable",
  status: number,
  extra?: Record<string, unknown>
): Response {
  return new Response(JSON.stringify({ error, ...extra }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<Response> {
  // ── 1. Parse & validate body ────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("bad_request", 400);
  }

  const parsed = AppointmentSchema.safeParse(body);
  if (!parsed.success) return jsonError("bad_request", 400);

  const { doctorId, startsAt, name, email, website } = parsed.data;

  // ── 2. Honeypot check ───────────────────────────────────────────────────
  if (website !== "") return jsonError("bad_request", 400);

  // ── 3. Rate limits ──────────────────────────────────────────────────────
  const ip = getIp(req);

  try {
    const [ipResult, emailResult, globalResult] = await Promise.all([
      bookingIpLimiter().limit(ip),
      bookingEmailLimiter().limit(email),
      bookingGlobalLimiter().limit("global"),
    ]);

    if (!ipResult.success || !emailResult.success) {
      return jsonError("rate_limited", 429);
    }
    if (!globalResult.success) {
      return jsonError("unavailable", 503);
    }
  } catch {
    // Upstash unavailable — fail open
    console.error("[appointments] rate-limit check failed — failing open");
  }

  // ── 4. Validate the slot is still real and available ────────────────────
  const startsAtDate = new Date(startsAt);
  const { dateStr } = utcToSydney(startsAtDate);

  // Fetch currently booked appointments (Supabase with local fallback)
  let bookedAppointments: Array<{
    doctor_id: string;
    starts_at: string;
    ends_at: string;
    status: "booked" | "cancelled";
  }> = [];

  try {
    const { data, error } = await db()
      .from("appointments")
      .select("doctor_id,starts_at,ends_at,status")
      .eq("status", "booked")
      .gte("starts_at", new Date().toISOString());

    if (error) {
      // Table doesn't exist yet in Supabase or connection issue: fallback to local records
      bookedAppointments = getLocalAppointments();
    } else {
      bookedAppointments = (data ?? []) as typeof bookedAppointments;
    }
  } catch {
    bookedAppointments = getLocalAppointments();
  }

  const availability = getAvailability(
    { date: dateStr, doctor_id: doctorId },
    { appointments: bookedAppointments }
  );

  const matchedSlot = availability.slots.find(
    (s) =>
      s.doctor_id === doctorId &&
      new Date(s.starts_at_iso).getTime() === startsAtDate.getTime()
  );

  if (!matchedSlot) {
    // Slot is no longer available — treat as taken and return fresh slots
    return jsonError("slot_taken", 409, {
      message: "This slot is no longer available.",
      slots: availability.slots,
      alternatives: availability.nearest_alternatives ?? [],
    });
  }

  // ── 5. Fetch doctor details from DB ─────────────────────────────────────
  let doctorName = matchedSlot.doctor_name;
  let doctorEmail = "doctor@example.com";

  try {
    const { data } = await db()
      .from("doctors")
      .select("name,email")
      .eq("id", doctorId)
      .single();

    if (data) {
      doctorName = data.name as string;
      doctorEmail = data.email as string;
    }
  } catch {
    // Non-fatal — use clinic.ts name from slot
  }

  // ── 6. Compute endsAt ───────────────────────────────────────────────────
  const endsAtDate = new Date(startsAtDate.getTime() + 30 * 60 * 1000);
  const endsAt = endsAtDate.toISOString();
  const label = formatSlotLabel(startsAtDate);

  // ── 7. Insert appointment ────────────────────────────────────────────────
  let insertSucceeded = false;
  try {
    const { error: insertError } = await db().from("appointments").insert({
      doctor_id: doctorId,
      patient_name: name,
      patient_email: email,
      starts_at: startsAt,
      ends_at: endsAt,
      status: "booked",
    });

    if (insertError) {
      // PostgreSQL exclusion constraint violation = double booking
      if (
        insertError.code === "23P01" ||
        insertError.message?.includes("no_double_booking") ||
        insertError.message?.includes("exclusion constraint")
      ) {
        // Double booking race caught by exclusion constraint: fetch fresh slots
        let freshBooked: typeof bookedAppointments = [];
        try {
          const { data } = await db()
            .from("appointments")
            .select("doctor_id,starts_at,ends_at,status")
            .eq("status", "booked")
            .gte("starts_at", new Date().toISOString());
          freshBooked = (data ?? []) as typeof freshBooked;
        } catch {
          freshBooked = getLocalAppointments();
        }
        const freshAvail = getAvailability(
          { date: dateStr, doctor_id: doctorId },
          { appointments: freshBooked }
        );
        return jsonError("slot_taken", 409, {
          message: "This slot was just booked by someone else.",
          slots: freshAvail.slots,
          alternatives: freshAvail.nearest_alternatives ?? [],
        });
      }

      // If appointments table not created in Supabase yet (PGRST205 / 42P01), use local fallback
      if (insertError.code === "PGRST205" || insertError.code === "42P01") {
        const localList = getLocalAppointments();
        const startMs = startsAtDate.getTime();
        const endMs = endsAtDate.getTime();
        const conflict = localList.some(
          (a) =>
            a.doctor_id === doctorId &&
            a.status === "booked" &&
            startMs < new Date(a.ends_at).getTime() &&
            endMs > new Date(a.starts_at).getTime()
        );
        if (conflict) {
          const freshAvail = getAvailability(
            { date: dateStr, doctor_id: doctorId },
            { appointments: localList }
          );
          return jsonError("slot_taken", 409, {
            message: "This slot was just booked by someone else.",
            slots: freshAvail.slots,
            alternatives: freshAvail.nearest_alternatives ?? [],
          });
        }
        saveLocalAppointment({
          id: `local-${Date.now()}`,
          doctor_id: doctorId,
          patient_name: name,
          patient_email: email,
          starts_at: startsAt,
          ends_at: endsAt,
          status: "booked",
          created_at: new Date().toISOString(),
        });
        insertSucceeded = true;
      } else {
        console.error("[appointments] Insert error:", insertError.code);
        return jsonError("unavailable", 503);
      }
    } else {
      insertSucceeded = true;
    }
  } catch {
    // Network / client exception — use local fallback
    const localList = getLocalAppointments();
    const startMs = startsAtDate.getTime();
    const endMs = endsAtDate.getTime();
    const conflict = localList.some(
      (a) =>
        a.doctor_id === doctorId &&
        a.status === "booked" &&
        startMs < new Date(a.ends_at).getTime() &&
        endMs > new Date(a.starts_at).getTime()
    );
    if (conflict) {
      const freshAvail = getAvailability(
        { date: dateStr, doctor_id: doctorId },
        { appointments: localList }
      );
      return jsonError("slot_taken", 409, {
        message: "This slot was just booked by someone else.",
        slots: freshAvail.slots,
        alternatives: freshAvail.nearest_alternatives ?? [],
      });
    }
    saveLocalAppointment({
      id: `local-${Date.now()}`,
      doctor_id: doctorId,
      patient_name: name,
      patient_email: email,
      starts_at: startsAt,
      ends_at: endsAt,
      status: "booked",
      created_at: new Date().toISOString(),
    });
    insertSucceeded = true;
  }

  if (!insertSucceeded) {
    return jsonError("unavailable", 503);
  }

  // ── 8. Send emails ───────────────────────────────────────────────────────
  const emailPayload: AppointmentEmailPayload = {
    doctorId,
    doctorName,
    doctorEmail,
    patientName: name,
    patientEmail: email,
    startsAt: startsAtDate,
    label,
  };

  let emailPreview: Awaited<ReturnType<typeof sendAppointmentEmails>>;
  try {
    emailPreview = await sendAppointmentEmails(emailPayload);
  } catch {
    // Emails are best-effort — appointment is already booked
    console.error("[appointments] Email delivery failed — appointment still booked");
    emailPreview = {
      patient: {
        subject: "Your appointment request: Alder & Finch Dental (sample)",
        body: "(email preview unavailable)",
      },
      doctor: {
        subject: `New booking: ${name} with ${doctorName}, ${label}`,
        body: "(email preview unavailable)",
      },
    };
  }

  // ── 9. Return success ────────────────────────────────────────────────────
  return new Response(
    JSON.stringify({
      ok: true,
      appointment: {
        doctorName,
        startsAt,
        label,
      },
      emailPreview,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
