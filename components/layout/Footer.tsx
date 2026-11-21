import Link from "next/link";
import { clinic } from "@/content/clinic";

export function Footer() {
  return (
    <footer className="bg-ink text-bone border-t border-ink py-16 px-4 sm:px-8 mt-auto">
      <div className="max-w-[1200px] mx-auto w-full space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Wordmark and Blurb */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-serif font-medium text-bone">
              {clinic.name}
            </h2>
            <p className="text-sm text-bone/80 max-w-sm leading-relaxed">
              {clinic.subhead}
            </p>
            <p className="text-xs text-sand/70 pt-2">
              Level 1, 12 Example Street, Sydney NSW 2000
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sand">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              {clinic.footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-bone/80 hover:text-white transition-colors focus-visible:outline-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening Hours & Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sand">
              Clinic Hours
            </h3>
            <div className="text-xs text-bone/80 space-y-1.5 leading-relaxed">
              <p>{clinic.hours.monFri}</p>
              <p>{clinic.hours.sat}</p>
              <p>{clinic.hours.sun}</p>
              <p className="pt-2 text-bone font-medium">
                Phone: {clinic.phone}
              </p>
              <p>Email: {clinic.email}</p>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer and Sample Branding */}
        <div className="pt-8 border-t border-bone/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-bone/70">
          <p>
            {clinic.sampleLabels.footerNotice}{" "}
            <a
              href={clinic.sampleLabels.topStripLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sand underline underline-offset-4 hover:text-white focus-visible:outline-2"
            >
              zalvrohq.com
            </a>
          </p>
          <p className="text-center md:text-right text-bone/60">
            {clinic.sampleLabels.formNotice}
          </p>
        </div>
      </div>
    </footer>
  );
}
