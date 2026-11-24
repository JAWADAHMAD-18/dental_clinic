/**
 * scripts/test-slots.ts
 *
 * Test suite for lib/booking/slots.ts availability engine.
 * Covers at least 12 distinct test cases per 07_BOOKING_ADDENDUM.md.
 *
 * Run with:
 *   npm run test:slots
 */

import {
  sydneyDateToUtc,
  utcToSydney,
  getSlotsForDate,
  getAvailability,
  BookedAppointment,
} from "../lib/booking/slots";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (detail) console.error(`    -> ${detail}`);
    failed++;
  }
}

console.log("=== Testing Slots & Availability Engine ===\n");

// Case 1: Closed day (Sunday) yields 0 slots
{
  // 2026-11-29 is a Sunday
  const fixedNow = new Date("2026-11-20T00:00:00Z");
  const slots = getSlotsForDate("2026-11-29", { now: fixedNow });
  assert(slots.length === 0, "Case 1: Sunday is closed and yields 0 slots");
}

// Case 2: Past dates yield 0 slots
{
  const fixedNow = new Date("2026-11-20T00:00:00Z");
  // 2026-11-15 is in the past relative to fixedNow
  const slots = getSlotsForDate("2026-11-15", { now: fixedNow });
  assert(slots.length === 0, "Case 2: Past dates yield 0 slots");
}

// Case 3: Same day slots within 2 hours of 'now' are excluded
{
  // Say now is Tuesday 2026-11-24 at 10:00 AM Sydney (which is 2026-11-23T23:00:00Z in AEDT)
  const fixedNow = sydneyDateToUtc("2026-11-24", "10:00");
  const slots = getSlotsForDate("2026-11-24", { now: fixedNow });

  // Earliest bookable must be >= 12:00 PM Sydney
  const hasEarlierThan12 = slots.some((s) => {
    const sDate = new Date(s.starts_at_iso);
    const sydney = utcToSydney(sDate);
    return sydney.hour < 12;
  });
  const hasAtOrAfter12 = slots.some((s) => {
    const sDate = new Date(s.starts_at_iso);
    const sydney = utcToSydney(sDate);
    return sydney.hour >= 12;
  });

  assert(
    !hasEarlierThan12 && hasAtOrAfter12,
    "Case 3: Slots within 2 hours of 'now' are excluded (< 12:00 excluded for 10:00 now)"
  );
}

// Case 4: 30-day limit: dates more than 30 days ahead yield 0 slots
{
  const fixedNow = sydneyDateToUtc("2026-11-01", "09:00");
  // 35 days ahead: 2026-12-06
  const slots = getSlotsForDate("2026-12-06", { now: fixedNow });
  assert(slots.length === 0, "Case 4: Date beyond 30 days ahead yields 0 slots");
}

// Case 5: Booked slots are excluded
{
  const fixedNow = sydneyDateToUtc("2026-11-20", "09:00");
  const bookedStart = sydneyDateToUtc("2026-11-26", "14:00");
  const bookedEnd = sydneyDateToUtc("2026-11-26", "14:30");

  const bookedAppointments: BookedAppointment[] = [
    {
      doctor_id: "dr-a",
      starts_at: bookedStart,
      ends_at: bookedEnd,
      status: "booked",
    },
  ];

  const slotsWithoutBooking = getSlotsForDate("2026-11-26", { now: fixedNow });
  const slotsWithBooking = getSlotsForDate("2026-11-26", {
    now: fixedNow,
    appointments: bookedAppointments,
  });

  const slotWasRemoved =
    slotsWithoutBooking.some(
      (s) => s.doctor_id === "dr-a" && s.starts_at_iso === bookedStart.toISOString()
    ) &&
    !slotsWithBooking.some(
      (s) => s.doctor_id === "dr-a" && s.starts_at_iso === bookedStart.toISOString()
    );

  assert(slotWasRemoved, "Case 5: Booked appointment excludes that slot for that doctor");
}

// Case 6: Cancelled appointment does NOT block slot
{
  const fixedNow = sydneyDateToUtc("2026-11-20", "09:00");
  const cancelledStart = sydneyDateToUtc("2026-11-26", "14:00");
  const cancelledEnd = sydneyDateToUtc("2026-11-26", "14:30");

  const appointments: BookedAppointment[] = [
    {
      doctor_id: "dr-a",
      starts_at: cancelledStart,
      ends_at: cancelledEnd,
      status: "cancelled",
    },
  ];

  const slots = getSlotsForDate("2026-11-26", {
    now: fixedNow,
    appointments,
  });

  const slotPresent = slots.some(
    (s) => s.doctor_id === "dr-a" && s.starts_at_iso === cancelledStart.toISOString()
  );

  assert(slotPresent, "Case 6: Cancelled appointment does NOT exclude the slot");
}

// Case 7: Part-of-day filter: morning (< 12:00)
{
  const fixedNow = sydneyDateToUtc("2026-11-20", "09:00");
  const slots = getSlotsForDate("2026-11-26", {
    now: fixedNow,
    time_of_day: "morning",
  });

  const allMorning = slots.every((s) => {
    const sInfo = utcToSydney(new Date(s.starts_at_iso));
    return sInfo.hour < 12;
  });

  assert(slots.length > 0 && allMorning, "Case 7: Part-of-day 'morning' only returns hours < 12:00");
}

// Case 8: Part-of-day filter: afternoon (12:00 - 17:00)
{
  const fixedNow = sydneyDateToUtc("2026-11-20", "09:00");
  const slots = getSlotsForDate("2026-11-26", {
    now: fixedNow,
    time_of_day: "afternoon",
  });

  const allAfternoon = slots.every((s) => {
    const sInfo = utcToSydney(new Date(s.starts_at_iso));
    return sInfo.hour >= 12 && sInfo.hour < 17;
  });

  assert(
    slots.length > 0 && allAfternoon,
    "Case 8: Part-of-day 'afternoon' only returns 12:00 <= hour < 17:00"
  );
}

// Case 9: Part-of-day filter: evening (>= 17:00)
{
  const fixedNow = sydneyDateToUtc("2026-11-20", "09:00");
  // On Thursday 2026-11-26, Dr A works until 19:00, Dr B works until 17:30
  const slots = getSlotsForDate("2026-11-26", {
    now: fixedNow,
    time_of_day: "evening",
  });

  const allEvening = slots.every((s) => {
    const sInfo = utcToSydney(new Date(s.starts_at_iso));
    return sInfo.hour >= 17;
  });

  assert(slots.length > 0 && allEvening, "Case 9: Part-of-day 'evening' only returns hour >= 17:00");
}

// Case 10: Specific doctor filter
{
  const fixedNow = sydneyDateToUtc("2026-11-20", "09:00");
  const slotsDrA = getSlotsForDate("2026-11-26", {
    now: fixedNow,
    doctor_id: "dr-a",
  });

  const onlyDrA = slotsDrA.every((s) => s.doctor_id === "dr-a");
  assert(slotsDrA.length > 0 && onlyDrA, "Case 10: Filtering by doctor_id returns only that doctor");
}

// Case 11: Doctor not working on day yields 0 slots for that doctor
{
  const fixedNow = sydneyDateToUtc("2026-11-20", "09:00");
  // Dr. A does not work on Friday (2026-11-27 is a Friday)
  const slotsDrAFriday = getSlotsForDate("2026-11-27", {
    now: fixedNow,
    doctor_id: "dr-a",
  });

  assert(
    slotsDrAFriday.length === 0,
    "Case 11: Doctor who does not work on that day yields 0 slots"
  );
}

// Case 12: Nearest alternatives fallback when requested day has no slots
{
  const fixedNow = sydneyDateToUtc("2026-11-20", "09:00");
  // 2026-11-22 is Sunday (closed)
  const res = getAvailability(
    { date: "2026-11-22" },
    { now: fixedNow }
  );

  const hasNoDirectSlots = res.slots.length === 0;
  const hasAlternatives = (res.nearest_alternatives?.length ?? 0) > 0;
  const max6Alternatives = (res.nearest_alternatives?.length ?? 0) <= 6;

  assert(
    hasNoDirectSlots && hasAlternatives && max6Alternatives,
    "Case 12: Zero slots on Sunday returns nearest alternatives on following open days (max 6)"
  );
}

// Case 13: DST transition in October (AEST UTC+10 to AEDT UTC+11)
{
  // First Sunday in October 2026 is 2026-10-04. Monday 2026-10-05 is first weekday in AEDT (UTC+11)
  const fixedNow = new Date("2026-10-01T00:00:00Z");
  const slots = getSlotsForDate("2026-10-05", { now: fixedNow });

  // 08:30 Sydney time on 2026-10-05 in AEDT (+11) corresponds to 2026-10-04T21:30:00.000Z
  const firstSlot = slots[0];
  const expectedUtc = "2026-10-04T21:30:00.000Z";

  assert(
    firstSlot?.starts_at_iso === expectedUtc,
    `Case 13: October DST transition correctly generates UTC+11 timestamps (${firstSlot?.starts_at_iso} === ${expectedUtc})`
  );
}

// Case 14: DST transition in April (AEDT UTC+11 to AEST UTC+10)
{
  // First Sunday in April 2026 is 2026-04-05. Monday 2026-04-06 is first weekday in AEST (UTC+10)
  const fixedNow = new Date("2026-04-01T00:00:00Z");
  const slots = getSlotsForDate("2026-04-06", { now: fixedNow });

  // 08:30 Sydney time on 2026-04-06 in AEST (+10) corresponds to 2026-04-05T22:30:00.000Z
  const firstSlot = slots[0];
  const expectedUtc = "2026-04-05T22:30:00.000Z";

  assert(
    firstSlot?.starts_at_iso === expectedUtc,
    `Case 14: April DST transition correctly generates UTC+10 timestamps (${firstSlot?.starts_at_iso} === ${expectedUtc})`
  );
}

// Case 15: 30-minute grid alignment (slots only start at :00 or :30)
{
  const fixedNow = sydneyDateToUtc("2026-11-20", "09:00");
  const slots = getSlotsForDate("2026-11-24", { now: fixedNow });

  const all30MinGrid = slots.every((s) => {
    const sInfo = utcToSydney(new Date(s.starts_at_iso));
    return sInfo.minute === 0 || sInfo.minute === 30;
  });

  assert(all30MinGrid && slots.length > 0, "Case 15: All slots align strictly to 30-minute grid (:00 or :30)");
}

// Case 16: Max 6 slots returned per availability card
{
  const fixedNow = sydneyDateToUtc("2026-11-20", "09:00");
  const res = getAvailability({ date: "2026-11-26" }, { now: fixedNow });
  assert(res.slots.length === 6, `Case 16: Returns at most 6 slots per card (got ${res.slots.length})`);
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log("All slot test cases passed successfully!");
}
