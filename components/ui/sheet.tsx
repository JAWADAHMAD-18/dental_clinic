"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { X } from "lucide-react";

interface SheetContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

export function Sheet({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(SheetContext);
  if (!context) throw new Error("SheetTrigger must be used within Sheet");

  return (
    <button
      type="button"
      onClick={() => context.setOpen(true)}
      aria-expanded={context.open}
      aria-haspopup="dialog"
      {...props}
    >
      {children}
    </button>
  );
}

export function SheetClose({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(SheetContext);
  if (!context) throw new Error("SheetClose must be used within Sheet");

  return (
    <button
      type="button"
      onClick={() => context.setOpen(false)}
      {...props}
    >
      {children}
    </button>
  );
}

export function SheetHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col space-y-2 text-left ${className}`} {...props}>
      {children}
    </div>
  );
}

export function SheetTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={`text-lg font-serif font-semibold text-ink ${className}`} {...props}>
      {children}
    </h2>
  );
}

export function SheetContent({
  side = "right",
  className = "",
  children,
}: {
  side?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  const context = useContext(SheetContext);
  if (!context) throw new Error("SheetContent must be used within Sheet");
  const { open, setOpen } = context;

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  if (!open) return null;

  const sideClasses = side === "left" ? "justify-start" : "justify-end";
  const borderClasses = side === "left" ? "border-r" : "border-l";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex ${sideClasses}`}
    >
      {/* Flat backdrop (no blur, flat color) */}
      <div
        className="fixed inset-0 bg-ink/50 transition-opacity"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className={`relative z-50 w-full max-w-xs bg-paper ${borderClasses} border-line p-6 shadow-none flex flex-col justify-between h-full transition-transform ${className}`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 p-2 rounded-full text-ink-soft hover:text-ink focus-visible:outline-2"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
