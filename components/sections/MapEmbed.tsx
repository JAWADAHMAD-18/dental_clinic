"use client";

import React, { useState } from "react";
import { clinic } from "@/content/clinic";
import { MapPin } from "lucide-react";

export function MapEmbed() {
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapsQuery = encodeURIComponent(clinic.address.full);
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${mapsQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="rounded-2xl border border-line bg-paper overflow-hidden">
      {!mapLoaded ? (
        <div className="p-8 sm:p-12 text-center bg-sand/30 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
          <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center text-clay border border-line">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-medium text-lg text-ink">
              Interactive Map
            </h3>
            <p className="text-xs text-ink-soft max-w-xs">
              {clinic.address.full}
            </p>
          </div>
          <p className="text-xs text-ink-soft/80 italic max-w-sm">
            Map is click-to-load to protect your privacy and ensure fast initial page performance.
          </p>
          <button
            type="button"
            onClick={() => setMapLoaded(true)}
            className="px-6 py-2.5 rounded-full border border-ink text-ink text-xs font-semibold hover:bg-sand transition-colors focus-visible:outline-2"
          >
            Load map
          </button>
        </div>
      ) : (
        <div className="relative w-full h-[320px] bg-sand">
          <iframe
            title={`Map location for ${clinic.name}`}
            src={mapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
}
