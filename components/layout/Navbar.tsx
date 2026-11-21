"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clinic } from "@/content/clinic";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-line">
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Wordmark (text only, no icon) */}
        <Link
          href="/"
          className="text-xl md:text-2xl font-serif font-medium tracking-tight text-ink hover:text-clay-text transition-colors focus-visible:outline-2"
        >
          {clinic.name}
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-8"
        >
          {clinic.navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-ink focus-visible:outline-2 ${
                  isActive
                    ? "text-ink font-semibold border-b-2 border-clay pb-0.5"
                    : "text-ink-soft"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Primary CTA Button */}
        <div className="hidden md:flex items-center">
          <Link
            href={clinic.primaryCta.href}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-clay text-white text-sm font-medium transition-colors hover:bg-clay-text focus-visible:outline-2"
          >
            {clinic.primaryCta.label}
          </Link>
        </div>

        {/* Mobile Hamburger Trigger */}
        <div className="flex md:hidden items-center">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="p-2 -mr-2 rounded-lg text-ink hover:bg-sand transition-colors focus-visible:outline-2"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="text-xl font-serif font-medium text-ink">
                  {clinic.name}
                </SheetTitle>
              </SheetHeader>

              <nav aria-label="Mobile Navigation" className="flex flex-col gap-4 mt-8">
                {clinic.navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`text-base font-medium py-2 px-3 rounded-lg transition-colors focus-visible:outline-2 ${
                        isActive
                          ? "bg-sand text-ink font-semibold"
                          : "text-ink-soft hover:bg-sand/60 hover:text-ink"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto pt-6 border-t border-line flex flex-col gap-4">
                <Link
                  href={clinic.primaryCta.href}
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-3 rounded-full bg-clay text-white text-sm font-medium hover:bg-clay-text transition-colors focus-visible:outline-2"
                >
                  {clinic.primaryCta.label}
                </Link>
                <div className="text-xs text-ink-soft space-y-1">
                  <p>{clinic.phone}</p>
                  <p>{clinic.hours.summary}</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
