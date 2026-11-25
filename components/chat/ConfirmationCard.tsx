"use client";

import { useState } from "react";
import { CheckCircle2, Mail, MapPin, Calendar, User, ChevronDown, ChevronUp } from "lucide-react";
import { AppointmentConfirmed } from "./types";
import { clinic } from "@/content/clinic";

interface ConfirmationCardProps {
  confirmed: AppointmentConfirmed;
}

export function ConfirmationCard({ confirmed }: ConfirmationCardProps) {
  const [activeTab, setActiveTab] = useState<"patient" | "doctor">("patient");
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="w-full mt-2.5 bg-paper border border-line rounded-xl p-3.5 shadow-xs space-y-3">
      {/* Success banner */}
      <div className="flex items-start gap-2 text-ink">
        <CheckCircle2 className="w-5 h-5 text-clay shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold text-ink">
            Booking request received (Sample)
          </h4>
          <p className="text-[11px] text-ink-soft">
            A confirmation has been prepared and sent.
          </p>
        </div>
      </div>

      {/* Appointment summary */}
      <div className="p-2.5 bg-sand/20 border border-line/80 rounded-lg space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-ink">
          <User className="w-3.5 h-3.5 text-clay shrink-0" />
          <span className="font-medium">{confirmed.doctorName}</span>
        </div>
        <div className="flex items-center gap-2 text-ink-soft">
          <Calendar className="w-3.5 h-3.5 text-ink-soft shrink-0" />
          <span>{confirmed.label} (30 mins)</span>
        </div>
        <div className="flex items-start gap-2 text-ink-soft">
          <MapPin className="w-3.5 h-3.5 text-ink-soft shrink-0 mt-0.5" />
          <span className="leading-tight">{clinic.address.full}</span>
        </div>
      </div>

      {/* Sample demonstration disclaimer */}
      <p className="text-[10px] text-ink-soft/90 italic leading-snug">
        This is a sample booking made on a demonstration website. No real
        appointment exists.
      </p>

      {/* Email preview collapsible section */}
      {confirmed.emailPreview && (
        <div className="pt-2 border-t border-line/80">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="w-full flex items-center justify-between text-[11px] font-medium text-ink hover:text-clay transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded py-1"
          >
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-clay" />
              <span>What the clinic and patient receive (Email preview)</span>
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-ink-soft" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-ink-soft" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-2 space-y-2">
              {/* Tab selector */}
              <div
                role="tablist"
                aria-label="Email preview recipient tabs"
                className="flex border-b border-line gap-1 text-[11px]"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "patient"}
                  onClick={() => setActiveTab("patient")}
                  className={`pb-1.5 px-2 font-medium transition-colors border-b-2 ${
                    activeTab === "patient"
                      ? "border-clay text-clay-text"
                      : "border-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  Patient confirmation
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "doctor"}
                  onClick={() => setActiveTab("doctor")}
                  className={`pb-1.5 px-2 font-medium transition-colors border-b-2 ${
                    activeTab === "doctor"
                      ? "border-clay text-clay-text"
                      : "border-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  Clinic notification
                </button>
              </div>

              {/* Email content preview */}
              <div className="p-2.5 bg-bone/70 border border-line rounded-lg text-xs space-y-1.5 font-mono text-[11px]">
                <div className="text-ink-soft pb-1 border-b border-line/60">
                  <span className="font-sans font-medium text-ink">Subject: </span>
                  <span>
                    {activeTab === "patient"
                      ? confirmed.emailPreview.patient.subject
                      : confirmed.emailPreview.doctor.subject}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-[10.5px] text-ink-soft leading-relaxed max-h-40 overflow-y-auto pt-1">
                  {activeTab === "patient"
                    ? confirmed.emailPreview.patient.body
                    : confirmed.emailPreview.doctor.body}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
