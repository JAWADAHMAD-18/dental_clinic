"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Slot, AppointmentConfirmed } from "./types";
import { clinic } from "@/content/clinic";

interface BookingFormProps {
  slot: Slot;
  onBack: () => void;
  onSuccess: (confirmed: AppointmentConfirmed) => void;
  onSlotTaken: (freshSlots?: Slot[], freshAlts?: Slot[]) => void;
}

export function BookingForm({
  slot,
  onBack,
  onSuccess,
  onSlotTaken,
}: BookingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // Honeypot
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setErrorMessage("Please enter your name (at least 2 characters).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!consent) {
      setErrorMessage("Please check the consent box to proceed.");
      return;
    }

    // Honeypot check
    if (website.length > 0) {
      setErrorMessage("Invalid submission.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: slot.doctor_id,
          startsAt: slot.starts_at_iso,
          name: trimmedName,
          email: trimmedEmail,
          consent: true,
          website: "",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 409 || data.error === "slot_taken") {
        // Race condition: slot was just taken
        onSlotTaken(data.slots, data.alternatives);
        return;
      }

      if (res.status === 429) {
        setErrorMessage(
          "Daily booking limit reached. Please call the clinic directly on " +
            clinic.phone +
            "."
        );
        setIsLoading(false);
        return;
      }

      if (res.status === 503) {
        setErrorMessage(
          "The booking system is currently resting. Please call us on " +
            clinic.phone +
            " or use the enquiry form."
        );
        setIsLoading(false);
        return;
      }

      if (!res.ok || !data.ok) {
        setErrorMessage(
          data.error || "Could not complete booking. Please try again."
        );
        setIsLoading(false);
        return;
      }

      // Success
      const confirmed: AppointmentConfirmed = {
        doctorName: data.appointment.doctorName,
        startsAt: data.appointment.startsAt,
        label: data.appointment.label,
        emailPreview: data.emailPreview,
      };

      onSuccess(confirmed);
    } catch {
      setErrorMessage("Connection error. Please check your internet and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mt-2.5 bg-paper border border-line rounded-xl p-3.5 shadow-xs space-y-3">
      {/* Slot summary header with back button */}
      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-line">
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-clay shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-ink">{slot.doctor_name}</p>
            <p className="text-[11px] text-ink-soft">{slot.label} (30 mins)</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          aria-label="Choose a different time"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-clay hover:text-clay-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded px-1.5 py-0.5 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Change</span>
        </button>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="flex items-start gap-1.5 p-2 bg-clay/10 border border-clay/20 rounded-lg text-clay-text text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-clay" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Inline booking form */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <label
            htmlFor="booking-name"
            className="block text-[11px] font-medium text-ink mb-1"
          >
            Your full name
          </label>
          <input
            id="booking-name"
            type="text"
            required
            disabled={isLoading}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah Jenkins"
            className="w-full text-xs px-2.5 py-1.5 bg-sand/20 border border-line rounded-lg text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-focus disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="booking-email"
            className="block text-[11px] font-medium text-ink mb-1"
          >
            Email address
          </label>
          <input
            id="booking-email"
            type="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah@example.com"
            className="w-full text-xs px-2.5 py-1.5 bg-sand/20 border border-line rounded-lg text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-focus disabled:opacity-50"
          />
          <p className="text-[10px] text-ink-soft mt-0.5">
            Confirmation email will be sent here.
          </p>
        </div>

        {/* Honeypot field — hidden from normal users */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="booking-website">Website</label>
          <input
            id="booking-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {/* Consent checkbox */}
        <div className="flex items-start gap-2 pt-1">
          <input
            id="booking-consent"
            type="checkbox"
            required
            disabled={isLoading}
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-line text-clay focus:ring-focus"
          />
          <label
            htmlFor="booking-consent"
            className="text-[11px] text-ink-soft leading-tight cursor-pointer"
          >
            I own this email address. This is a sample site; no real appointment
            is made.
          </label>
        </div>

        {/* Actions */}
        <div className="pt-1.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="text-xs font-medium text-ink-soft hover:text-ink px-2 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !consent || !name.trim() || !email.trim()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-clay text-white text-xs font-medium hover:bg-clay-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Confirming...</span>
              </>
            ) : (
              <span>Confirm booking</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
