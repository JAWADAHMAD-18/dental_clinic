"use client";

import React, { useState } from "react";
import { z } from "zod";
import { clinic } from "@/content/clinic";
import { ClinicInboxPreview, EnquiryPreviewData } from "./ClinicInboxPreview";

const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  contact: z.string().trim().min(5, "Please enter a phone number or email"),
  preferredTime: z.enum(["Morning", "Afternoon", "Evening", "After-hours"], {
    message: "Please select a preferred time of day",
  }),
  reason: z.string().min(1, "Please select a service or reason for your visit"),
  note: z
    .string()
    .max(200, "Notes are limited to 200 characters")
    .optional(),
  consent: z.literal(true, {
    error: "You must accept the sample website notice to proceed",
  }),
  website: z.string().max(0, "Spam detected"),
});

export function EnquiryForm({ initialReason = "" }: { initialReason?: string }) {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    preferredTime: "Morning",
    reason: initialReason || clinic.services[0].name,
    note: "",
    consent: false,
    website: "", // honeypot
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedData, setSubmittedData] = useState<EnquiryPreviewData | null>(
    null
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = enquirySchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as string;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const preview: EnquiryPreviewData = {
      name: formData.name,
      contact: formData.contact,
      preferredTime: formData.preferredTime,
      reason: formData.reason,
      note: formData.note ? formData.note : undefined,
      timestamp: new Date().toLocaleTimeString("en-AU", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setSubmittedData(preview);
  };

  if (submittedData) {
    return (
      <ClinicInboxPreview
        data={submittedData}
        onReset={() => {
          setSubmittedData(null);
          setFormData({
            name: "",
            contact: "",
            preferredTime: "Morning",
            reason: clinic.services[0].name,
            note: "",
            consent: false,
            website: "",
          });
        }}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Appointment enquiry form"
      className="p-6 sm:p-8 rounded-2xl bg-paper border border-line space-y-6"
    >
      {/* Honeypot field - invisible to genuine users */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-serif font-normal text-ink">
          Send an enquiry
        </h2>
        <p className="text-xs text-ink-soft">
          We review requests during clinic hours and reply on the next business day.
        </p>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="block text-xs font-semibold uppercase tracking-wider text-ink"
        >
          Your Name <span className="text-clay" aria-hidden="true">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={`w-full px-4 py-2.5 rounded-xl bg-bone border text-ink text-sm transition-colors focus-visible:outline-2 ${
            errors.name ? "border-clay" : "border-line"
          }`}
          placeholder="e.g. Jane Smith"
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-xs text-clay-text font-medium">
            {errors.name}
          </p>
        )}
      </div>

      {/* Phone or Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="contact"
          className="block text-xs font-semibold uppercase tracking-wider text-ink"
        >
          Phone or Email <span className="text-clay" aria-hidden="true">*</span>
        </label>
        <input
          id="contact"
          name="contact"
          type="text"
          required
          autoComplete="email tel"
          value={formData.contact}
          onChange={handleChange}
          aria-invalid={!!errors.contact}
          aria-describedby={errors.contact ? "contact-error" : undefined}
          className={`w-full px-4 py-2.5 rounded-xl bg-bone border text-ink text-sm transition-colors focus-visible:outline-2 ${
            errors.contact ? "border-clay" : "border-line"
          }`}
          placeholder="e.g. 0400 000 000 or jane@example.com"
        />
        {errors.contact && (
          <p id="contact-error" role="alert" className="text-xs text-clay-text font-medium">
            {errors.contact}
          </p>
        )}
      </div>

      {/* Preferred Time & Reason Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preferred Time */}
        <div className="space-y-1.5">
          <label
            htmlFor="preferredTime"
            className="block text-xs font-semibold uppercase tracking-wider text-ink"
          >
            Preferred Time <span className="text-clay" aria-hidden="true">*</span>
          </label>
          <select
            id="preferredTime"
            name="preferredTime"
            value={formData.preferredTime}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-bone border border-line text-ink text-sm transition-colors focus-visible:outline-2"
          >
            <option value="Morning">Morning (8am – 12pm)</option>
            <option value="Afternoon">Afternoon (12pm – 4pm)</option>
            <option value="Evening">Evening (4pm – 6pm)</option>
            <option value="After-hours">After-hours (Sat / Late Thu)</option>
          </select>
        </div>

        {/* Reason for Visit */}
        <div className="space-y-1.5">
          <label
            htmlFor="reason"
            className="block text-xs font-semibold uppercase tracking-wider text-ink"
          >
            Reason for Visit <span className="text-clay" aria-hidden="true">*</span>
          </label>
          <select
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl bg-bone border border-line text-ink text-sm transition-colors focus-visible:outline-2"
          >
            {clinic.services.map((s) => (
              <option key={s.slug} value={s.name}>
                {s.name}
              </option>
            ))}
            <option value="General enquiry">General enquiry</option>
          </select>
        </div>
      </div>

      {/* Short Note */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="note"
            className="block text-xs font-semibold uppercase tracking-wider text-ink"
          >
            Short Note (Optional)
          </label>
          <span className="text-xs text-ink-soft">
            {formData.note.length}/200
          </span>
        </div>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={200}
          value={formData.note}
          onChange={handleChange}
          aria-invalid={!!errors.note}
          aria-describedby="note-helper"
          className={`w-full px-4 py-2.5 rounded-xl bg-bone border text-ink text-sm transition-colors resize-none focus-visible:outline-2 ${
            errors.note ? "border-clay" : "border-line"
          }`}
          placeholder="Any scheduling preferences or questions..."
        />
        <p id="note-helper" className="text-xs text-ink-soft italic">
          Please don&apos;t include medical details.
        </p>
        {errors.note && (
          <p role="alert" className="text-xs text-clay-text font-medium">
            {errors.note}
          </p>
        )}
      </div>

      {/* Consent Checkbox */}
      <div className="space-y-1.5 pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            checked={formData.consent}
            onChange={handleChange}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-1 h-4 w-4 rounded border-line text-clay focus-visible:outline-2"
          />
          <span className="text-xs text-ink-soft leading-normal">
            I agree to be contacted about this enquiry. This is a sample website; please don&apos;t enter real information.
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" role="alert" className="text-xs text-clay-text font-medium">
            {errors.consent}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3.5 px-6 rounded-full bg-clay text-white text-sm font-medium hover:bg-clay-text transition-colors focus-visible:outline-2"
      >
        Send enquiry
      </button>

      <p className="text-center text-xs text-ink-soft/80">
        {clinic.sampleLabels.formNotice}
      </p>
    </form>
  );
}
