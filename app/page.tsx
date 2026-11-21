import { clinic } from "@/content/clinic";
import { Reveal } from "@/components/reveal";

export default function Home() {
  return (
    <div className="min-h-screen bg-bone text-ink p-6 md:p-12 flex flex-col items-center">
      <main className="w-full max-w-4xl space-y-12">
        {/* Sample Strip Test */}
        <div className="bg-sand text-ink text-xs md:text-sm py-2 px-4 rounded-md flex justify-between items-center border border-line">
          <span>{clinic.sampleLabels.topStrip}</span>
          <a
            href={clinic.sampleLabels.topStripLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-clay-text font-medium underline underline-offset-4"
          >
            zalvrohq.com
          </a>
        </div>

        {/* Heading & Typography Demonstration */}
        <div className="space-y-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
            P1 Foundation Test
          </span>
          <h1 className="text-4xl md:text-6xl font-normal tracking-tight text-ink">
            {clinic.tagline}
          </h1>
          <p className="text-lg md:text-xl text-ink-soft max-w-2xl">
            {clinic.subhead}
          </p>
        </div>

        {/* Colour Palette Swatches */}
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

        {/* Content File Data Verification via Reveal */}
        <Reveal delay={0.1}>
          <div className="p-6 rounded-xl bg-paper border border-line space-y-4">
            <h2 className="text-2xl font-normal text-ink">
              Clinic Source of Truth ({clinic.name})
            </h2>
            <div className="text-sm text-ink-soft space-y-2">
              <p>
                <strong className="text-ink">Address:</strong> {clinic.address.full}
              </p>
              <p>
                <strong className="text-ink">Phone:</strong> {clinic.phone} |{" "}
                <strong className="text-ink">Email:</strong> {clinic.email}
              </p>
              <p>
                <strong className="text-ink">Hours:</strong> {clinic.hours.summary}
              </p>
              <p>
                <strong className="text-ink">Services loaded:</strong>{" "}
                {clinic.services.length} items (
                {clinic.services.map((s) => s.name).join(", ")})
              </p>
              <p>
                <strong className="text-ink">Team members loaded:</strong>{" "}
                {clinic.team.length} items (
                {clinic.team.map((t) => t.name).join(", ")})
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-clay text-white font-medium text-sm transition-colors hover:bg-clay-text"
              >
                {clinic.primaryCta.label}
              </button>
            </div>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
