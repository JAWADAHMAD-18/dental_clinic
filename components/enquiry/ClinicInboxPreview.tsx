import React from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export interface EnquiryPreviewData {
  name: string;
  contact: string;
  preferredTime: string;
  reason: string;
  note?: string;
  timestamp: string;
}

export function ClinicInboxPreview({
  data,
  onReset,
}: {
  data: EnquiryPreviewData;
  onReset?: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-sand/60 border border-line text-ink">
        <CheckCircle2 className="w-5 h-5 text-clay shrink-0" />
        <p className="text-sm font-medium">
          Thanks, your enquiry has been sent.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-paper overflow-hidden shadow-none">
        <div className="bg-sand/30 border-b border-line px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-clay" />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink">
              What the clinic receives
            </span>
          </div>
          <span className="text-xs text-ink-soft">{data.timestamp}</span>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <div className="space-y-1 pb-4 border-b border-line">
            <p className="text-xs text-ink-soft">Subject:</p>
            <p className="font-medium text-ink">
              New website enquiry: {data.reason}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-ink-soft block text-xs">Patient Name:</span>
              <span className="font-medium text-ink">{data.name}</span>
            </div>
            <div>
              <span className="text-ink-soft block text-xs">Contact Info:</span>
              <span className="font-medium text-ink">{data.contact}</span>
            </div>
            <div>
              <span className="text-ink-soft block text-xs">Preferred Time:</span>
              <span className="font-medium text-ink capitalize">
                {data.preferredTime}
              </span>
            </div>
            <div>
              <span className="text-ink-soft block text-xs">Reason for Visit:</span>
              <span className="font-medium text-ink">{data.reason}</span>
            </div>
          </div>

          {data.note && (
            <div className="pt-2">
              <span className="text-ink-soft block text-xs">Patient Note:</span>
              <p className="mt-1 p-3 rounded-lg bg-sand/20 border border-line text-xs sm:text-sm text-ink leading-relaxed">
                {data.note}
              </p>
            </div>
          )}
        </div>

        <div className="bg-sand/20 px-6 py-3 border-t border-line text-xs text-ink-soft">
          <p className="italic">
            This is a sample of the notification a clinic would receive.
          </p>
        </div>
      </div>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="w-full text-center py-2.5 px-4 rounded-full border border-line text-xs font-medium text-ink hover:bg-sand/60 transition-colors focus-visible:outline-2"
        >
          Submit another test enquiry
        </button>
      )}
    </div>
  );
}
