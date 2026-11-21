import Link from "next/link";
import { clinic } from "@/content/clinic";
import { Reveal } from "@/components/reveal";
import { ArrowRight } from "lucide-react";

export function FeesSnapshot() {
  // First 3 sample fees
  const sampleItems = clinic.feeItems.slice(0, 3);

  return (
    <section className="py-16 md:py-24 border-t border-line">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
                  Transparent Pricing
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sand text-ink font-medium border border-line">
                  {clinic.sampleLabels.feesLabel}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-ink">
                Clear treatment estimates
              </h2>
              <p className="text-ink-soft text-base leading-relaxed">
                {clinic.sampleLabels.feesDisclaimer}
              </p>
            </div>

            <Link
              href="/fees"
              className="inline-flex items-center gap-2 text-sm font-medium text-clay-text hover:text-ink transition-colors focus-visible:outline-2"
            >
              <span>View complete fee schedule</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleItems.map((item, idx) => (
            <Reveal key={item.service} delay={idx * 0.08}>
              <div className="p-6 rounded-xl bg-paper border border-line flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sand/80 text-ink-soft">
                    Service
                  </span>
                  <h3 className="text-lg font-serif font-medium text-ink">
                    {item.service}
                  </h3>
                  {item.details && (
                    <p className="text-xs text-ink-soft leading-relaxed">
                      {item.details}
                    </p>
                  )}
                </div>
                <div className="pt-4 border-t border-line/60">
                  <p className="text-2xl font-serif font-normal text-clay-text">
                    {item.sampleFee}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
