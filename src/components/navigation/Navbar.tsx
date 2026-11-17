"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

const NAV_LINKS = [
  { label: "Accueil", href: ROUTES.HOME },
  { label: "Mentors", href: ROUTES.MENTORS_CATALOG },
  { label: "Opportunités", href: ROUTES.OPPORTUNITIES_CATALOG },
  { label: "Masterclasses", href: ROUTES.MASTERCLASSES_CATALOG },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            aria-label="MentorPro – Accueil"
          >
            <Image
              src="/logo/Logo Mentor_plateforme.png"
              alt="MentorPro — Apprendre · Évoluer · Réussir"
              width={140}
              height={48}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Navigation Desktop */}
          <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                  "hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  pathname === link.href
                    ? "text-primary font-semibold bg-primary/8"
                    : "text-foreground/80"
                )}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={ROUTES.AUTH.LOGIN}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-semibold text-primary",
                "border border-primary/30 hover:border-primary hover:bg-primary/5",
                "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              Se connecter
            </Link>
            <Link
              href={ROUTES.AUTH.REGISTER}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-semibold text-white bg-primary",
                "hover:bg-primary/90 transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              )}
            >
              Rejoindre la plateforme
            </Link>
          </div>

          {/* Bouton menu mobile */}
          <button
            type="button"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen((v) => !v)}
            className={cn(
              "md:hidden inline-flex items-center justify-center p-2 rounded-md",
              "text-foreground hover:bg-primary/8 hover:text-primary",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          >
            {isOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-border bg-white/98 backdrop-blur-md"
        >
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary font-semibold bg-primary/8"
                    : "text-foreground/80 hover:bg-primary/5 hover:text-primary"
                )}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="px-4 pb-5 pt-2 border-t border-border flex flex-col gap-2">
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="w-full text-center px-4 py-2.5 rounded-md text-sm font-semibold text-primary border border-primary/30 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="w-full text-center px-4 py-2.5 rounded-md text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Rejoindre la plateforme
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
