"use client";

import { useMemo } from "react";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { Slot } from "./types";

interface SlotsCardProps {
  slots?: Slot[];
  alternatives?: Slot[];
  slotTakenNotice?: string | null;
  onSelectSlot: (slot: Slot) => void;
}

export function SlotsCard({
  slots = [],
  alternatives = [],
  slotTakenNotice,
  onSelectSlot,
}: SlotsCardProps) {
  // Group primary slots by doctor
  const slotsByDoctor = useMemo(() => {
    const map = new Map<string, { doctorName: string; slots: Slot[] }>();
    for (const slot of slots) {
      if (!map.has(slot.doctor_id)) {
        map.set(slot.doctor_id, {
          doctorName: slot.doctor_name,
          slots: [],
        });
      }
      map.get(slot.doctor_id)!.slots.push(slot);
    }
    return Array.from(map.values());
  }, [slots]);

  // Group alternative slots by doctor if present
  const altsByDoctor = useMemo(() => {
    const map = new Map<string, { doctorName: string; slots: Slot[] }>();
    for (const slot of alternatives) {
      if (!map.has(slot.doctor_id)) {
        map.set(slot.doctor_id, {
          doctorName: slot.doctor_name,
          slots: [],
        });
      }
      map.get(slot.doctor_id)!.slots.push(slot);
    }
    return Array.from(map.values());
  }, [alternatives]);

  if (slots.length === 0 && alternatives.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-2.5 space-y-3 bg-paper border border-line rounded-xl p-3 shadow-xs">
      {/* Notice if slot was just taken */}
      {slotTakenNotice && (
        <div className="flex items-start gap-2 p-2 bg-clay/10 border border-clay/20 rounded-lg text-clay-text text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-clay" />
          <span>{slotTakenNotice}</span>
        </div>
      )}

      {/* Primary slots */}
      {slotsByDoctor.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
            <Calendar className="w-3.5 h-3.5 text-clay" />
            <span>Available appointment times</span>
          </div>

          {slotsByDoctor.map((group) => (
            <div key={group.doctorName} className="space-y-1.5">
              <p className="text-[11px] font-medium text-ink-soft">
                {group.doctorName}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.slots.map((slot) => (
                  <button
                    key={`${slot.doctor_id}-${slot.starts_at_iso}`}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    aria-label={`Book with ${slot.doctor_name} at ${slot.label}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sand/30 hover:bg-sand/70 border border-line text-xs font-medium text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <Clock className="w-3 h-3 text-ink-soft" />
                    <span>{slot.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alternative dates/slots */}
      {alternatives.length > 0 && (
        <div className="pt-2 border-t border-line/60 space-y-2.5">
          <p className="text-xs font-medium text-ink-soft flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-ink-soft" />
            <span>
              {slots.length === 0
                ? "Nearest available days:"
                : "Other upcoming dates:"}
            </span>
          </p>

          {altsByDoctor.map((group) => (
            <div key={`alt-${group.doctorName}`} className="space-y-1.5">
              <p className="text-[11px] font-medium text-ink-soft">
                {group.doctorName}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.slots.map((slot) => (
                  <button
                    key={`alt-${slot.doctor_id}-${slot.starts_at_iso}`}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    aria-label={`Book with ${slot.doctor_name} at ${slot.label}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sand/20 hover:bg-sand/50 border border-line/80 text-xs font-medium text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <Clock className="w-3 h-3 text-ink-soft" />
                    <span>{slot.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
