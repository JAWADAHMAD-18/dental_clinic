import type { Metadata } from "next";
import { clinic } from "@/content/clinic";
import { EnquiryForm } from "@/components/enquiry";
import { MapEmbed } from "@/components/sections";
import { Reveal } from "@/components/reveal";
import { Phone, Mail, MapPin, Clock, Car, Navigation, Accessibility } from "lucide-react";

export const metadata: Metadata = {
  title: `Contact | ${clinic.name} (Sample)`,
  description: "Send an online dental enquiry or find our clinic address, opening hours, and parking information.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContactPage() {
  const telHref = `tel:${clinic.phone.replace(/[^0-9+]/g, "")}`;

  return (
    <div className="min-h-screen">
      {/* Inner page header with half vertical padding */}
      <header className="py-8 md:py-12 border-b border-line bg-paper/50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 space-y-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-ink">
            Contact and enquiries
          </h1>
          <p className="text-ink-soft text-base md:text-lg max-w-2xl leading-relaxed">
            Send an enquiry online any time. Our reception team responds during practice hours to answer questions and schedule appointments.
          </p>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Enquiry Form */}
          <div className="lg:col-span-7">
            <Reveal>
              <EnquiryForm />
            </Reveal>
          </div>

          {/* Right Column: Details Block + MapEmbed */}
          <div className="lg:col-span-5 space-y-8">
            <Reveal delay={0.1}>
              <div className="p-6 sm:p-8 rounded-2xl bg-paper border border-line space-y-6">
                <h2 className="text-xl font-serif font-medium text-ink pb-3 border-b border-line">
                  Clinic details
                </h2>

                {/* Primary contact points */}
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-clay shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-ink">Address</p>
                      <p className="text-ink-soft text-xs sm:text-sm">
                        {clinic.address.full}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-clay shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-ink">Phone</p>
                      <a
                        href={telHref}
                        className="text-clay-text text-xs sm:text-sm hover:underline"
                      >
                        {clinic.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-clay shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-ink">Email</p>
                      <a
                        href={`mailto:${clinic.email}`}
                        className="text-clay-text text-xs sm:text-sm hover:underline"
                      >
                        {clinic.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-clay shrink-0 mt-1" />
                    <div className="space-y-0.5 text-xs sm:text-sm">
                      <p className="font-medium text-ink">Hours</p>
                      <p className="text-ink-soft">{clinic.hours.monFri}</p>
                      <p className="text-ink-soft">{clinic.hours.sat}</p>
                      <p className="text-ink-soft">{clinic.hours.sun}</p>
                    </div>
                  </div>
                </div>

                {/* Parking, Transit & Accessibility Notes */}
                <div className="pt-4 border-t border-line space-y-3 text-xs text-ink-soft">
                  <h3 className="font-semibold uppercase tracking-wider text-ink text-xs">
                    Access & Parking
                  </h3>

                  <div className="flex items-start gap-2.5">
                    <Car className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                    <p>{clinic.contactNotes.parking}</p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Accessibility className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                    <p>{clinic.contactNotes.accessibility}</p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Navigation className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                    <p>{clinic.contactNotes.transit}</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Click-to-load Map Card */}
            <Reveal delay={0.15}>
              <MapEmbed />
            </Reveal>
          </div>
        </div>
      </main>
    </div>
  );
}
