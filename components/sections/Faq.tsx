import { clinic } from "@/content/clinic";
import { Reveal } from "@/components/reveal";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function Faq() {
  return (
    <section className="py-16 md:py-24 bg-paper/60 border-t border-line">
      <div className="max-w-[800px] mx-auto px-4 sm:px-8">
        <Reveal>
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-semibold tracking-wider uppercase text-clay-text">
              Frequently Asked
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal text-ink">
              Common questions
            </h2>
            <p className="text-ink-soft text-base">
              Everything you need to know about our appointments, fees, and care approach.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bg-paper p-6 sm:p-8 rounded-2xl border border-line">
            <Accordion defaultValue="faq-0">
              {clinic.faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
