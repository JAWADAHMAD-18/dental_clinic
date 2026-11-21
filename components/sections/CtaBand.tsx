"use client";

import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { MessageSquare, Calendar } from "lucide-react";

export function CtaBand() {
  const handleOpenChat = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-alder-chat"));
    }
  };

  return (
    <section className="py-20 bg-ink text-bone border-t border-ink">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center">
        <Reveal>
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-bone">
              Have a question?
            </h2>
            <p className="text-sand/90 text-lg leading-relaxed">
              Ask Alder, our virtual assistant, or send us an enquiry. We are here to help you understand your options and feel prepared.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleOpenChat}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-sand text-ink text-sm font-medium transition-colors hover:bg-white focus-visible:outline-2"
              >
                <MessageSquare className="w-4 h-4 text-clay" />
                <span>Ask Alder</span>
              </button>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-clay text-white text-sm font-medium transition-colors hover:bg-clay-text focus-visible:outline-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Make an enquiry</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
