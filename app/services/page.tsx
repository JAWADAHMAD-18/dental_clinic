import type { Metadata } from "next";
import Link from "next/link";
import { clinic } from "@/content/clinic";
import { Reveal } from "@/components/reveal";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: `Services | ${clinic.name} (Sample)`,
  description: "Comprehensive general, preventive, and cosmetic dental treatments in central Sydney.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Inner page header with half vertical padding */}
      <header className="py-8 md:py-12 border-b border-line bg-paper/50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
            Treatment Overview
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-ink">
            Our services
          </h1>
          <p className="text-ink-soft text-base md:text-lg max-w-2xl leading-relaxed">
            Every procedure is delivered with gentle techniques, clear explanations, and itemised written costs before any work begins.
          </p>
        </div>
      </header>

      {/* Services List */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12 md:py-16 space-y-12">
        <div className="space-y-12">
          {clinic.services.map((service, idx) => (
            <Reveal key={service.slug} delay={idx * 0.05}>
              <article
                id={service.slug}
                className="scroll-mt-24 p-6 sm:p-10 rounded-2xl bg-paper border border-line space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
                  <h2 className="text-2xl sm:text-3xl font-serif font-normal text-ink">
                    {service.name}
                  </h2>
                  <div className="inline-flex items-center gap-2">
                    <span className="text-xs text-ink-soft uppercase tracking-wider">
                      {clinic.sampleLabels.feesLabel}:
                    </span>
                    <span className="text-base sm:text-lg font-serif font-medium text-clay-text">
                      {service.sampleFee}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-ink-soft">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">
                      What it is
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed">
                      {service.whatItIs}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-ink">
                      What to expect
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed">
                      {service.whatToExpect}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <Link
                    href={`/contact?reason=${encodeURIComponent(service.name)}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-clay hover:text-clay-text transition-colors focus-visible:outline-2"
                  >
                    <span>Make an enquiry about {service.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Short Note at End */}
        <Reveal>
          <div className="p-6 rounded-xl bg-sand/40 border border-line text-center space-y-2">
            <p className="text-xs sm:text-sm text-ink-soft font-medium">
              {clinic.sampleLabels.feesDisclaimer}
            </p>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
