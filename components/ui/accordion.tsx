"use client";

import React, { createContext, useContext, useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionContextType {
  openItem: string | null;
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined
);

export function Accordion({
  children,
  className = "",
  defaultValue = null,
}: {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string | null;
}) {
  const [openItem, setOpenItem] = useState<string | null>(defaultValue);

  const toggleItem = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  return (
    <AccordionContext.Provider value={{ openItem, toggleItem }}>
      <div className={`divide-y divide-line ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextType {
  value: string;
}

const AccordionItemContext = createContext<AccordionItemContextType | undefined>(
  undefined
);

export function AccordionItem({
  value,
  children,
  className = "",
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={`py-4 ${className}`}>{children}</div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const accordion = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);

  if (!accordion || !item) {
    throw new Error("AccordionTrigger must be used within AccordionItem and Accordion");
  }

  const isOpen = accordion.openItem === item.value;

  return (
    <h3 className="flex">
      <button
        type="button"
        onClick={() => accordion.toggleItem(item.value)}
        aria-expanded={isOpen}
        className={`flex flex-1 items-center justify-between py-2 text-left text-base md:text-lg font-medium text-ink transition-colors hover:text-clay-text focus-visible:outline-2 ${className}`}
      >
        <span>{children}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-ink-soft transition-transform duration-200 ${
            isOpen ? "rotate-180 text-clay" : ""
          }`}
          aria-hidden="true"
        />
      </button>
    </h3>
  );
}

export function AccordionContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const accordion = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);

  if (!accordion || !item) {
    throw new Error("AccordionContent must be used within AccordionItem and Accordion");
  }

  const isOpen = accordion.openItem === item.value;

  if (!isOpen) return null;

  return (
    <div
      role="region"
      className={`pt-2 pb-4 text-sm md:text-base text-ink-soft leading-relaxed transition-all ${className}`}
    >
      {children}
    </div>
  );
}
