import { clinic } from "@/content/clinic";

export function SampleStrip() {
  return (
    <aside
      aria-label="Sample site notice"
      className="bg-sand border-b border-line text-xs py-2 px-4 text-ink flex items-center justify-between text-center md:text-left transition-colors"
    >
      <div className="max-w-[1200px] mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4 px-4 sm:px-8">
        <span>{clinic.sampleLabels.topStrip}</span>
        <a
          href={clinic.sampleLabels.topStripLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-clay-text font-medium underline underline-offset-4 hover:text-ink focus-visible:outline-2"
        >
          zalvrohq.com
        </a>
      </div>
    </aside>
  );
}
