import Link from "next/link";
import { clinic } from "@/content/clinic";
import { Reveal } from "@/components/reveal";
import { ArrowRight } from "lucide-react";

export function ServicesGrid() {
  return (
    <section className="py-16 md:py-24 bg-paper/60 border-t border-line">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <Reveal>
          <div className="max-w-2xl space-y-3 mb-12">
            <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
              Comprehensive Care
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-ink">
              Our core dental services
            </h2>
            <p className="text-ink-soft text-base leading-relaxed">
              From routine preventive cleans to gentle restorative treatments, every appointment is structured to keep you informed and comfortable.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinic.services.map((service, idx) => (
            <Reveal key={service.slug} delay={idx * 0.06}>
              <div className="group h-full flex flex-col justify-between p-6 rounded-xl bg-paper border border-line transition-all duration-200 hover:-translate-y-1 hover:shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-medium text-ink">
                      {service.name}
                    </h3>
                    <span className="text-xs font-medium text-clay-text">
                      {service.sampleFee}
                    </span>
                  </div>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="pt-6">
                  <Link
                    href={`/services#${service.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-clay-text hover:text-ink transition-colors focus-visible:outline-2"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
