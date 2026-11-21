import { clinic } from "@/content/clinic";
import { Phone, MapPin, Mail, Clock } from "lucide-react";

export function TopBar() {
  const telHref = `tel:${clinic.phone.replace(/[^0-9+]/g, "")}`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    clinic.address.full
  )}`;

  return (
    <div className="bg-ink text-bone text-xs py-2 px-4 border-b border-ink">
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-8">
        {/* Mobile: single 'Call' and 'Directions' row */}
        <div className="flex md:hidden items-center justify-around py-0.5 text-xs font-medium">
          <a
            href={telHref}
            className="flex items-center gap-1.5 py-1 px-3 rounded hover:text-sand focus-visible:outline-2"
          >
            <Phone className="w-3.5 h-3.5 text-clay" />
            <span>Call {clinic.phone}</span>
          </a>
          <span className="text-sand/40" aria-hidden="true">|</span>
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 py-1 px-3 rounded hover:text-sand focus-visible:outline-2"
          >
            <MapPin className="w-3.5 h-3.5 text-clay" />
            <span>Directions</span>
          </a>
        </div>

        {/* Desktop: phone, email, address, opening hours summary */}
        <div className="hidden md:flex items-center justify-between text-xs text-bone/90">
          <div className="flex items-center gap-6">
            <a
              href={telHref}
              className="flex items-center gap-1.5 hover:text-white transition-colors focus-visible:outline-2"
            >
              <Phone className="w-3.5 h-3.5 text-clay" />
              <span>{clinic.phone}</span>
            </a>
            <a
              href={`mailto:${clinic.email}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors focus-visible:outline-2"
            >
              <Mail className="w-3.5 h-3.5 text-clay" />
              <span>{clinic.email}</span>
            </a>
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors focus-visible:outline-2"
            >
              <MapPin className="w-3.5 h-3.5 text-clay" />
              <span>{clinic.address.full}</span>
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-bone/80">
            <Clock className="w-3.5 h-3.5 text-clay" />
            <span>{clinic.hours.summary}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
