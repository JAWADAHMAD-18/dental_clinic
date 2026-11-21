import type { Metadata } from "next";
import Link from "next/link";
import { clinic } from "@/content/clinic";
import { Reveal } from "@/components/reveal";
import { FileText, CreditCard, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: `Fees | ${clinic.name} (Sample)`,
  description: "Transparent sample dental fees and payment information for Alder & Finch Dental.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FeesPage() {
  return (
    <div className="min-h-screen">
      {/* Inner page header with half vertical padding */}
      <header className="py-8 md:py-12 border-b border-line bg-paper/50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
              Cost Guidance
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sand text-ink font-medium border border-line">
              {clinic.sampleLabels.feesLabel}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-ink">
            Fees and payment
          </h1>
          <p className="text-ink-soft text-base md:text-lg max-w-2xl leading-relaxed">
            {clinic.sampleLabels.feesDisclaimer}
          </p>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12 md:py-16 space-y-12">
        {/* Sample Fees Table */}
        <Reveal>
          <div className="rounded-2xl border border-line bg-paper overflow-hidden shadow-none">
            <div className="p-6 border-b border-line flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-serif font-normal text-ink">
                  Common treatments
                </h2>
                <p className="text-xs text-ink-soft mt-1">
                  All fees are starting guides; itemised quotes provided after examination.
                </p>
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded bg-sand/70 text-ink border border-line">
                {clinic.sampleLabels.feesLabel}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-line bg-sand/20 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    <th scope="col" className="py-3.5 px-6">Treatment</th>
                    <th scope="col" className="py-3.5 px-6 hidden sm:table-cell">Inclusions</th>
                    <th scope="col" className="py-3.5 px-6 text-right">Sample Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink">
                  {clinic.feeItems.map((item) => (
                    <tr key={item.service} className="hover:bg-sand/10 transition-colors">
                      <td className="py-4 px-6 font-medium">
                        <div>{item.service}</div>
                        {item.details && (
                          <div className="sm:hidden text-xs text-ink-soft mt-0.5">
                            {item.details}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-ink-soft hidden sm:table-cell">
                        {item.details || "—"}
                      </td>
                      <td className="py-4 px-6 text-right font-serif text-base text-clay-text whitespace-nowrap">
                        {item.sampleFee}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        {/* Important Payment Notes */}
        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-paper border border-line space-y-3">
              <div className="w-10 h-10 rounded-full bg-sand/70 flex items-center justify-center text-clay">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-medium text-lg text-ink">
                Written Estimates
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                {clinic.feeNotes[0]}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-paper border border-line space-y-3">
              <div className="w-10 h-10 rounded-full bg-sand/70 flex items-center justify-center text-clay">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-medium text-lg text-ink">
                Health Fund Claims
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                {clinic.feeNotes[1]}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-paper border border-line space-y-3">
              <div className="w-10 h-10 rounded-full bg-sand/70 flex items-center justify-center text-clay">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-medium text-lg text-ink">
                Cancellation Notice
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                {clinic.feeNotes[2]}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Action Prompt */}
        <Reveal delay={0.15}>
          <div className="p-8 rounded-2xl bg-paper border border-line flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-medium text-ink">
                Questions about specific treatment costs?
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft">
                Submit an enquiry and our team will outline what to expect for your visit.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-clay text-white text-sm font-medium hover:bg-clay-text transition-colors focus-visible:outline-2 shrink-0"
            >
              Make an enquiry
            </Link>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
