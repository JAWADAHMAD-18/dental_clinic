import Link from "next/link";
import { clinic } from "@/content/clinic";
import { Reveal } from "@/components/reveal";
import { ArrowRight } from "lucide-react";

export function TeamPreview() {
  // Preview first three team members
  const previewMembers = clinic.team.slice(0, 3);

  return (
    <section className="py-16 md:py-24 bg-paper/60 border-t border-line">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
                  Care Team
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sand text-ink font-medium border border-line">
                  {clinic.sampleLabels.teamNotice}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-ink">
                Dedicated clinicians and staff
              </h2>
              <p className="text-ink-soft text-base leading-relaxed">
                Our practitioners focus on preventive care, calm communication, and making sure you are never rushed.
              </p>
            </div>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-medium text-clay-text hover:text-ink transition-colors focus-visible:outline-2"
            >
              <span>View full practice team</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewMembers.map((member, idx) => (
            <Reveal key={member.name} delay={idx * 0.08}>
              <div className="p-6 rounded-xl bg-paper border border-line flex flex-col items-start space-y-4">
                {/* Monogram circle (initials on --sand) */}
                <div className="w-14 h-14 rounded-full bg-sand text-ink font-serif text-lg font-semibold flex items-center justify-center border border-line">
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
                <p className="text-sm text-ink-soft leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
