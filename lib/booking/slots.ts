/**
 * lib/booking/slots.ts
 *
 * Pure, timezone-correct (Australia/Sydney) appointment slot generation.
 *
 * Rules (from 07_BOOKING_ADDENDUM.md):
 * - Timezone: Australia/Sydney.
 * - 30-minute slots on a 30-minute grid.
 * - Inside doctor working hours and clinic hours.
 * - Earliest bookable: now + 2 hours.
 * - Latest: 30 days ahead.
 * - Exclude booked slots. No slots in the past, none on closed days (Sunday).
 * - Max 6 slots per card. If none on requested day, return next 3 days with slots.
 */

import { clinic, ClinicDoctor } from "@/content/clinic";

export const CLINIC_TIMEZONE = "Australia/Sydney";
const SLOT_DURATION_MS = 30 * 60 * 1000;
const EARLIEST_BUFFER_MS = 2 * 60 * 60 * 1000; // 2 hours
const LATEST_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_SLOTS_PER_CARD = 6;

export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface BookedAppointment {
  doctor_id: string;
  starts_at: string | Date;
  ends_at: string | Date;
  status: "booked" | "cancelled";
}

export interface Slot {
  doctor_id: string;
  doctor_name: string;
  starts_at_iso: string;
  label: string;
}

export interface AvailabilityQuery {
  date: string; // "YYYY-MM-DD"
  time_of_day?: TimeOfDay;
  doctor_id?: string;
}

export interface AvailabilityResult {
  slots: Slot[];
  nearest_alternatives?: Slot[];
}

/**
 * Converts a Sydney wall-clock date and time (HH:MM) to a UTC Date object.
 * Timezone-aware across Daylight Saving Time boundaries (AEDT/AEST).
 */
export function sydneyDateToUtc(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);

  // Initial estimate with UTC+10
  const guess = new Date(Date.UTC(y, m - 1, d, hh - 10, mm));

  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = dtf.formatToParts(guess);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  const sHour = parseInt(get("hour"), 10) % 24;
  const sMin = parseInt(get("minute"), 10);

  const diffMinutes = (sHour - hh) * 60 + (sMin - mm);
  return new Date(guess.getTime() - diffMinutes * 60 * 1000);
}

/**
 * Breaks down a UTC Date object into its Australia/Sydney components.
 */
export function utcToSydney(date: Date): {
  dateStr: string; // "YYYY-MM-DD"
  timeStr: string; // "HH:MM"
  weekday: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  hour: number;
  minute: number;
} {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hour12: false,
  });

  const parts = dtf.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  const hour = parseInt(get("hour"), 10) % 24;
  const minute = parseInt(get("minute"), 10);

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    dateStr: `${get("year")}-${get("month")}-${get("day")}`,
    timeStr: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    weekday: weekdayMap[get("weekday")] ?? 0,
    hour,
    minute,
  };
}

/**
 * Formats a slot timestamp into an Australian English display string.
 * Example: "Thu 26 Nov, 2:30 pm"
 */
export function formatSlotLabel(date: Date): string {
  const dtf = new Intl.DateTimeFormat("en-AU", {
    timeZone: CLINIC_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return dtf.format(date);
}

/**
 * Checks if a slot time matches a part-of-day filter.
 */
function matchesTimeOfDay(hour: number, filter?: TimeOfDay): boolean {
  if (!filter) return true;
  if (filter === "morning") return hour < 12;
  if (filter === "afternoon") return hour >= 12 && hour < 17;
  if (filter === "evening") return hour >= 17;
  return true;
}

/**
 * Checks if a prospective slot interval overlaps any active booked appointment.
 */
function isSlotOverlapping(
  slotStart: Date,
  slotEnd: Date,
  doctorId: string,
  appointments: BookedAppointment[]
): boolean {
  const startMs = slotStart.getTime();
  const endMs = slotEnd.getTime();

  for (const appt of appointments) {
    if (appt.doctor_id !== doctorId || appt.status !== "booked") continue;
    const aStart = new Date(appt.starts_at).getTime();
    const aEnd = new Date(appt.ends_at).getTime();

    // Overlap condition
    if (startMs < aEnd && endMs > aStart) {
      return true;
    }
  }
  return false;
}

/**
 * Generates all valid, unbooked slots for a single specific date string.
 */
export function getSlotsForDate(
  dateStr: string,
  options: {
    appointments?: BookedAppointment[];
    time_of_day?: TimeOfDay;
    doctor_id?: string;
    now?: Date;
    doctors?: ClinicDoctor[];
  } = {}
): Slot[] {
  const now = options.now ?? new Date();
  const appointments = options.appointments ?? [];
  const doctors = options.doctors ?? clinic.doctors ?? [];

  const earliestAllowed = now.getTime() + EARLIEST_BUFFER_MS;
  const latestAllowed = now.getTime() + LATEST_WINDOW_MS;

  // Inspect the weekday of this date in Sydney
  const testNoon = sydneyDateToUtc(dateStr, "12:00");
  const sydneyInfo = utcToSydney(testNoon);
  const weekday = sydneyInfo.weekday;

  // Sunday is closed (0 slots)
  if (weekday === 0) return [];

  const activeDoctors = doctors.filter(
    (d) => d.active && (!options.doctor_id || d.id === options.doctor_id)
  );

  const daySlots: Slot[] = [];

  for (const doc of activeDoctors) {
    const shift = doc.workingHours.find((wh) => wh.weekday === weekday);
    if (!shift) continue;

    // Convert shift start and end times to minutes from midnight
    const [startH, startM] = shift.startTime.split(":").map(Number);
    const [endH, endM] = shift.endTime.split(":").map(Number);

    const shiftStartMins = startH * 60 + startM;
    const shiftEndMins = endH * 60 + endM;

    for (let m = shiftStartMins; m + 30 <= shiftEndMins; m += 30) {
      const hh = Math.floor(m / 60);
      const mm = m % 60;
      const timeStr = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

      if (!matchesTimeOfDay(hh, options.time_of_day)) continue;

      const slotStart = sydneyDateToUtc(dateStr, timeStr);
      const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MS);
      const slotStartMs = slotStart.getTime();

      // Enforce earliest (+2 hrs) and latest (30 days) limits
      if (slotStartMs < earliestAllowed || slotStartMs > latestAllowed) {
        continue;
      }

      // Check double-booking / conflict
      if (isSlotOverlapping(slotStart, slotEnd, doc.id, appointments)) {
        continue;
      }

      daySlots.push({
        doctor_id: doc.id,
        doctor_name: doc.name,
        starts_at_iso: slotStart.toISOString(),
        label: formatSlotLabel(slotStart),
      });
    }
  }

  // Sort chronologically by starts_at_iso, then doctor_name
  daySlots.sort((a, b) => {
    const diff = new Date(a.starts_at_iso).getTime() - new Date(b.starts_at_iso).getTime();
    return diff !== 0 ? diff : a.doctor_name.localeCompare(b.doctor_name);
  });

  return daySlots;
}

/**
 * Main availability search function.
 * Returns up to 6 slots for the requested date, or up to 6 nearest alternatives
 * spanning the next 3 available days if the requested date has 0 slots.
 */
export function getAvailability(
  query: AvailabilityQuery,
  options: {
    appointments?: BookedAppointment[];
    now?: Date;
    doctors?: ClinicDoctor[];
  } = {}
): AvailabilityResult {
  const now = options.now ?? new Date();

  // Primary slots for the requested day
  const directSlots = getSlotsForDate(query.date, {
    appointments: options.appointments,
    time_of_day: query.time_of_day,
    doctor_id: query.doctor_id,
    now,
    doctors: options.doctors,
  });

  if (directSlots.length > 0) {
    return {
      slots: directSlots.slice(0, MAX_SLOTS_PER_CARD),
    };
  }

  // Fallback: search for the next 3 days that have available slots
  const [y, m, d] = query.date.split("-").map(Number);
  const alternatives: Slot[] = [];
  let foundDaysCount = 0;

  // Search up to 30 days ahead from requested date
  for (let offset = 1; offset <= 30 && foundDaysCount < 3; offset++) {
    // Add offset days in UTC approximation to get next date string
    const nextDateObj = new Date(Date.UTC(y, m - 1, d + offset, 12, 0, 0));
    const nextSydney = utcToSydney(nextDateObj);
    const candidateDateStr = nextSydney.dateStr;

    const candidateSlots = getSlotsForDate(candidateDateStr, {
      appointments: options.appointments,
      time_of_day: query.time_of_day,
      doctor_id: query.doctor_id,
      now,
      doctors: options.doctors,
    });

    if (candidateSlots.length > 0) {
      foundDaysCount++;
      // Take slots from this alternative day
      alternatives.push(...candidateSlots);
    }
  }

  return {
    slots: [],
    nearest_alternatives:
      alternatives.length > 0 ? alternatives.slice(0, MAX_SLOTS_PER_CARD) : undefined,
  };
}
