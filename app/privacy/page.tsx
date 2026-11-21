import type { Metadata } from "next";
import Link from "next/link";
import { clinic } from "@/content/clinic";

export const metadata: Metadata = {
  title: `Privacy | ${clinic.name} (Sample)`,
  description: "Plain-language privacy notice for the Alder & Finch Dental sample website.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Inner page header with half vertical padding */}
      <header className="py-8 md:py-12 border-b border-line bg-paper/50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
            Legal
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-ink">
            Privacy notice
          </h1>
          <p className="text-ink-soft text-base md:text-lg max-w-2xl leading-relaxed">
            Plain-language information about how this sample website handles data.
          </p>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 sm:px-8 py-12 md:py-16">
        <div className="prose-like space-y-10 text-ink-soft text-sm sm:text-base leading-relaxed">

          {/* Sample Site Notice */}
          <div className="p-5 rounded-xl bg-sand/40 border border-line text-sm text-ink space-y-1">
            <p className="font-medium">
              {clinic.sampleLabels.topStrip}
            </p>
            <p className="text-xs text-ink-soft">
              This is a demonstration website built by{" "}
              <a
                href={clinic.sampleLabels.topStripLink}
                className="text-clay-text underline underline-offset-4 hover:text-ink"
                target="_blank"
                rel="noopener noreferrer"
              >
                Zalvro
              </a>{" "}
              for Australian dental clinics. {clinic.name} is a fictional practice. No real patient data is processed.
            </p>
          </div>

          {/* What we collect */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-ink">
              What information the form collects
            </h2>
            <p>
              The enquiry form on the Contact page collects only the minimum details needed to respond to a dental appointment request:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Your name</li>
              <li>A phone number or email address</li>
              <li>A preferred appointment time (morning, afternoon, evening, or after-hours)</li>
              <li>A reason for the visit (chosen from the services list)</li>
              <li>An optional short note (up to 200 characters)</li>
            </ul>
            <p>
              <strong className="text-ink font-semibold">We do not collect medical histories, clinical notes, or sensitive personal information.</strong> The note field includes helper text instructing visitors not to include medical details.
            </p>
          </section>

          {/* Why we collect it */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-ink">
              Why this information is collected
            </h2>
            <p>
              In a live deployment, the clinic would use these details solely to contact the person who submitted the form and confirm an appointment time. No information would be used for marketing purposes without explicit separate consent.
            </p>
            <p>
              In this sample demonstration, submitted enquiry data is displayed back to the visitor as a preview of what a real clinic would receive. It is not transmitted to any server or stored permanently.
            </p>
          </section>

          {/* Demo retention */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-ink">
              Data retention in this demo
            </h2>
            <p>
              Any enquiries submitted through this demonstration website would be deleted after seven days in a production database. No real personally identifiable information should be entered into this form.
            </p>
            <p>
              The virtual assistant (Alder) does not store the content of chat messages. Chat sessions are transient and not logged to any persistent store.
            </p>
          </section>

          {/* Chat messages */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-ink">
              Chat assistant
            </h2>
            <p>
              The Alder virtual assistant uses an AI language model to answer questions about clinic services, fees, and operating hours. Chat messages are processed in real time and are not stored after the session ends. Rate limiting is applied by IP address to prevent misuse; this information is held only in short-term memory and is not retained.
            </p>
            <p className="font-medium text-ink text-sm">
              Please do not enter real personal, medical, or financial information into the chat assistant.
            </p>
          </section>

          {/* Australian Privacy Principles */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-ink">
              Australian Privacy Principles
            </h2>
            <p>
              The design and data-handling approach of this demonstration is informed by the Australian Privacy Principles (APPs) under the <em>Privacy Act 1988</em>. However, as a non-functional sample website, it makes no claim of regulatory compliance.
            </p>
            <p>
              A real dental practice deploying a site of this kind would need to maintain a formal privacy policy compliant with the APPs, the <em>My Health Records Act 2012</em>, and any applicable state health privacy legislation.
            </p>
          </section>

          {/* Removal Requests */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-ink">
              Data removal requests
            </h2>
            <p>
              To request the deletion of any data you may have submitted to this demonstration website, contact us at{" "}
              <a
                href="mailto:contact@zalvrohq.com"
                className="text-clay-text underline underline-offset-4 hover:text-ink"
              >
                contact@zalvrohq.com
              </a>
              . We will action removal requests within 48 hours.
            </p>
          </section>

          {/* Robots / Crawling */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-ink">
              Search engine indexing
            </h2>
            <p>
              This website is configured with <code className="text-xs bg-sand/60 px-1.5 py-0.5 rounded">noindex, nofollow</code> meta tags and an <code className="text-xs bg-sand/60 px-1.5 py-0.5 rounded">X-Robots-Tag</code> response header on every page. The <code className="text-xs bg-sand/60 px-1.5 py-0.5 rounded">robots.txt</code> file also disallows all crawlers. This ensures the sample website does not appear in web search results.
            </p>
          </section>

          {/* Back Link */}
          <div className="pt-6 border-t border-line">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-clay-text hover:text-ink transition-colors focus-visible:outline-2"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
