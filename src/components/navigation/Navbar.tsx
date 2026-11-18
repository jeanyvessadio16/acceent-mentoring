"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LogIn,
  ArrowRight,
} from "lucide-react";
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

  // Verrouiller le scroll du body lorsque le menu mobile est ouvert
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
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
                  "px-4 py-2 rounded-full text-sm font-semibold text-primary",
                  "border border-primary/30 hover:border-primary hover:bg-primary/5",
                  "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                Se connecter
              </Link>
              <Link
                href={ROUTES.AUTH.REGISTER}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold text-white bg-primary",
                  "hover:bg-primary/90 transition-colors duration-200 shadow-xs",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                )}
              >
                Rejoindre la plateforme
              </Link>
            </div>

            {/* Bouton burger mobile */}
            <button
              type="button"
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-sidebar"
              onClick={() => setIsOpen(true)}
              className={cn(
                "md:hidden inline-flex items-center justify-center p-2 rounded-lg",
                "text-foreground hover:bg-primary/8 hover:text-primary",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              <Menu className="h-6 w-6" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop sombre d'arrière-plan */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Mobile : Située à droite, occupe 100% de la hauteur, sans scroll */}
      <aside
        id="mobile-sidebar"
        aria-label="Menu mobile"
        aria-hidden={!isOpen}
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-sm h-screen h-[100dvh] max-h-[100dvh]",
          "bg-white shadow-2xl flex flex-col justify-between overflow-hidden overscroll-none select-none",
          "transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* En-tête de la barre latérale */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <Link
            href={ROUTES.HOME}
            onClick={() => setIsOpen(false)}
            className="flex items-center focus-visible:outline-none"
          >
            <Image
              src="/logo/Logo Mentor_plateforme.png"
              alt="MentorPro"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer le menu"
            className="inline-flex items-center justify-center h-10 w-10 rounded-full text-foreground/70 hover:text-foreground hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Liens de navigation verticaux */}
        <nav
          aria-label="Navigation mobile"
          className="flex-1 px-5 py-6 flex flex-col justify-center gap-2 overflow-hidden"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all",
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "text-foreground/85 hover:bg-slate-100 hover:text-primary"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Boutons d'action en bas (style arrondi identique à la connexion/inscription) */}
        <div className="p-5 border-t border-border bg-slate-50/80 shrink-0 flex flex-col gap-3">
          <Link
            href={ROUTES.AUTH.LOGIN}
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 h-11 w-full rounded-full text-sm font-semibold text-primary border border-primary/30 hover:border-primary hover:bg-primary/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <LogIn className="h-4 w-4" aria-hidden />
            <span>Se connecter</span>
          </Link>
          <Link
            href={ROUTES.AUTH.REGISTER}
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 h-11 w-full rounded-full text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Rejoindre la plateforme</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </aside>
    </>
  );
}
