import Link from "next/link";
import { Reveal } from "@/components/reveal";

export function Process() {
  const steps = [
    {
      num: "01",
      title: "Tell us what you need",
      description: "Send a short enquiry online, any time. Share your preferred time and the reason for your visit.",
    },
    {
      num: "02",
      title: "We confirm a time",
      description: "Our team reviews enquiries and replies during business hours to confirm an appointment that suits you.",
    },
    {
      num: "03",
      title: "Meet your dentist",
      description: "A relaxed first visit with an unhurried exam, clear explanations, and written costs before any treatment begins.",
    },
  ];

  return (
    <section className="py-16 md:py-24 border-t border-line">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <Reveal>
          <div className="max-w-2xl space-y-3 mb-12">
            <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
              First Visit Guide
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-ink">
              How your first visit works
            </h2>
            <p className="text-ink-soft text-base leading-relaxed">
              We know dental appointments can feel daunting. We keep our booking and consultation process completely straightforward.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <Reveal key={step.num} delay={idx * 0.08}>
              <div className="h-full p-8 rounded-xl bg-paper border border-line flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-sm font-serif font-semibold text-clay px-2.5 py-1 rounded bg-sand/60 inline-block">
                    Step {step.num}
                  </span>
                  <h3 className="text-xl font-serif font-medium text-ink">
                    {step.title}
                  </h3>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.24}>
          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-clay text-white text-sm font-medium transition-colors hover:bg-clay-text focus-visible:outline-2"
            >
              Start your enquiry
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
