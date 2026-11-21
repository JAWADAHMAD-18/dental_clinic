import { clinic } from "@/content/clinic";
import { Reveal } from "@/components/reveal";

export default function Home() {
  return (
    <div className="py-12 px-4 sm:px-8 max-w-[1200px] mx-auto w-full space-y-12">
      {/* Heading & Typography */}
      <div className="space-y-4 max-w-2xl">
        <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
          Sample Clinic
        </span>
        <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-ink">
          {clinic.tagline}
        </h1>
        <p className="text-lg text-ink-soft">
          {clinic.subhead}
        </p>
      </div>

      {/* Colour Tokens Demonstration */}
      <Reveal>
        <div className="space-y-4">
          <h2 className="text-2xl font-normal text-ink">Design Tokens</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-bone border border-line text-xs font-medium space-y-1">
              <div className="w-full h-8 rounded bg-bone border border-line" />
              <p className="text-ink">--bone</p>
              <p className="text-ink-soft">#F6F2EA</p>
            </div>
            <div className="p-4 rounded-xl bg-paper border border-line text-xs font-medium space-y-1">
              <div className="w-full h-8 rounded bg-paper border border-line" />
              <p className="text-ink">--paper</p>
              <p className="text-ink-soft">#FFFDF9</p>
            </div>
            <div className="p-4 rounded-xl bg-sand border border-line text-xs font-medium space-y-1">
              <div className="w-full h-8 rounded bg-sand border border-line" />
              <p className="text-ink">--sand</p>
              <p className="text-ink-soft">#E9DFD2</p>
            </div>
            <div className="p-4 rounded-xl bg-line text-xs font-medium space-y-1">
              <div className="w-full h-8 rounded bg-line" />
              <p className="text-ink">--line</p>
              <p className="text-ink-soft">#E2DACB</p>
            </div>
            <div className="p-4 rounded-xl bg-ink text-bone text-xs font-medium space-y-1">
              <div className="w-full h-8 rounded bg-ink" />
              <p>--ink</p>
              <p className="opacity-80">#17263B</p>
            </div>
            <div className="p-4 rounded-xl bg-ink-soft text-bone text-xs font-medium space-y-1">
              <div className="w-full h-8 rounded bg-ink-soft" />
              <p>--ink-soft</p>
              <p className="opacity-80">#4A5870</p>
            </div>
            <div className="p-4 rounded-xl bg-clay text-white text-xs font-medium space-y-1">
              <div className="w-full h-8 rounded bg-clay" />
              <p>--clay</p>
              <p className="opacity-80">#B85C38</p>
            </div>
            <div className="p-4 rounded-xl bg-paper border border-line text-xs font-medium space-y-1">
              <div className="w-full h-8 rounded bg-clay-text" />
              <p className="text-clay-text">--clay-text</p>
              <p className="text-ink-soft">#A84F2E</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Services from Clinic Source of Truth */}
      <Reveal delay={0.1}>
        <div className="p-6 rounded-xl bg-paper border border-line space-y-4">
          <h2 className="text-2xl font-normal text-ink">
            Services ({clinic.name})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clinic.services.map((service) => (
              <div
                key={service.slug}
                className="p-4 rounded-lg bg-bone border border-line space-y-1.5"
              >
                <h3 className="font-medium text-ink">{service.name}</h3>
                <p className="text-xs text-ink-soft">{service.shortDescription}</p>
                <p className="text-xs font-semibold text-clay-text pt-1">
                  {service.sampleFee}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
