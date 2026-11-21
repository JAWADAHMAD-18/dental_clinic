import type { Metadata } from "next";
import Link from "next/link";
import { clinic } from "@/content/clinic";
import { Reveal } from "@/components/reveal";
import { ShieldCheck, Sparkles, Smile, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: `About | ${clinic.name} (Sample)`,
  description: "Learn about our calm philosophy, clear communication, and dedicated team.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AboutPage() {
  const iconList = [
    <Smile key="1" className="w-5 h-5 text-clay" />,
    <Sparkles key="2" className="w-5 h-5 text-clay" />,
    <ShieldCheck key="3" className="w-5 h-5 text-clay" />,
  ];

  return (
    <div className="min-h-screen">
      {/* Inner page header with half vertical padding */}
      <header className="py-8 md:py-12 border-b border-line bg-paper/50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
            Our Practice
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-ink">
            {clinic.about.heading}
          </h1>
          <p className="text-ink-soft text-base md:text-lg max-w-2xl leading-relaxed">
            {clinic.about.subhead}
          </p>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12 md:py-16 space-y-16">
        {/* Practice Philosophy & Approach */}
        <section className="space-y-10">
          <Reveal>
            <div className="max-w-3xl space-y-4">
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-ink">
                Our approach to patient care
              </h2>
              <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
                {clinic.about.approachParagraph}
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {clinic.about.values.map((val, idx) => (
              <Reveal key={val.title} delay={idx * 0.08}>
                <div className="p-6 rounded-xl bg-paper border border-line space-y-3 h-full">
                  <div className="w-10 h-10 rounded-full bg-sand/70 flex items-center justify-center">
                    {iconList[idx % iconList.length]}
                  </div>
                  <h3 className="font-serif font-medium text-lg text-ink">
                    {val.title}
                  </h3>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {val.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="space-y-8 pt-8 border-t border-line">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
                    Staff
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-sand text-ink font-medium border border-line">
                    {clinic.sampleLabels.teamNotice}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-normal text-ink">
                  Meet our clinicians
                </h2>
              </div>
              <p className="text-xs text-ink-soft max-w-xs">
                Fictional profile monograms representing our sample practice roles.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clinic.team.map((member, idx) => (
              <Reveal key={member.name} delay={idx * 0.06}>
                <div className="p-6 rounded-xl bg-paper border border-line flex flex-col items-start space-y-4 h-full">
                  {/* Monogram circle (initials on --sand) */}
                  <div className="w-14 h-14 rounded-full bg-sand text-ink font-serif text-lg font-semibold flex items-center justify-center border border-line shrink-0">
                    {member.initials}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-serif font-medium text-ink">
                      {member.name}
                    </h3>
                    <p className="text-xs font-medium text-clay-text uppercase tracking-wide">
                      {member.role}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA block */}
        <Reveal>
          <div className="p-8 rounded-2xl bg-paper border border-line flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-medium text-ink">
                Ready to book your first appointment?
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft">
                Send us a short online enquiry and we will confirm a convenient time.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-clay text-white text-sm font-medium hover:bg-clay-text transition-colors focus-visible:outline-2 shrink-0"
            >
              <span>{clinic.primaryCta.label}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
