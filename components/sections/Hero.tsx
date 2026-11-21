import Image from "next/image";
import Link from "next/link";
import { clinic } from "@/content/clinic";

export function Hero() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left: Text Content with CSS keyframe staggering */}
          <div className="lg:col-span-7 space-y-6">
            <div className="hero-animate-1">
              <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
                Central Sydney Dental Practice
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-ink mt-2 leading-[1.12]">
                {clinic.tagline}
              </h1>
            </div>

            <p className="hero-animate-2 text-lg sm:text-xl text-ink-soft max-w-xl leading-relaxed">
              {clinic.subhead}
            </p>

            <div className="hero-animate-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-clay text-white text-base font-medium transition-colors hover:bg-clay-text focus-visible:outline-2"
              >
                Make an enquiry
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full border border-ink text-ink text-base font-medium transition-colors hover:bg-sand focus-visible:outline-2"
              >
                See our services
              </Link>
            </div>

            <p className="hero-animate-4 text-xs text-ink-soft">
              Enquire online any time. We reply on the next business day.
            </p>
          </div>

          {/* Right: Verified Unsplash Image */}
          <div className="lg:col-span-5 hero-animate-image">
            <div className="relative rounded-2xl overflow-hidden border border-line bg-sand aspect-[4/3] sm:aspect-[16/11]">
              <Image
                src={clinic.images.hero.url}
                alt={clinic.images.hero.alt}
                width={clinic.images.hero.width}
                height={clinic.images.hero.height}
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 480px"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
