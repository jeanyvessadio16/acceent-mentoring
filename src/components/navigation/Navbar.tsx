'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';
import { Menu, X } from 'lucide-react';

import { useAuth } from '@/lib/auth/client';
import { logoutAction } from '@/features/auth/actions';

interface NavbarProps {
  isAuthenticated?: boolean;
  userRole?: string;
}

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/mentors', label: 'Trouver un Mentor' },
  { href: '/opportunites', label: 'Opportunités' },
  { href: '/masterclasses', label: 'Masterclasses' },
  { href: '/diagnostic', label: 'Diagnostic', isHighlighted: true },
  { href: '/devenir-mentor', label: 'Devenir Mentor' },
];

function NavLinksDesktop() {
  const pathname = usePathname();
  return (
    <div className="hidden md:flex items-center gap-6">
      {navLinks.slice(0, 5).map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors hover:text-brand-primary ${isActive ? 'text-brand-primary font-semibold' : 'text-foreground/80'
              }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

function NavLinksFallback() {
  return (
    <div className="hidden md:flex items-center gap-6">
      {navLinks.slice(0, 5).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium transition-colors hover:text-brand-primary text-foreground/80"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function Navbar({ isAuthenticated: propIsAuth, userRole: propRole }: NavbarProps) {
  const { isAuthenticated: clientIsAuth, role: clientRole, userName, userEmail } = useAuth();
  const isAuthenticated = propIsAuth ?? clientIsAuth;
  const userRole = propRole ?? clientRole;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Verrouiller le défilement de l'arrière-plan quand le menu latéral est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileMenuOpen]);

  // Fermeture automatique avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getDashboardLink = () => {
    switch (userRole) {
      case 'MENTOR':
      case 'EXPERT':
        return '/mentor/dashboard';
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '/admin/dashboard';
      default:
        return '/beneficiary/dashboard';
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return 'Administrateur';
      case 'MENTOR':
      case 'EXPERT':
        return 'Mentor';
      default:
        return 'Bénéficiaire';
    }
  };

  // Tiroir latéral rendu via React Portal sur document.body
  const mobileDrawer = mounted && isMobileMenuOpen ? (
    createPortal(
      <div className="fixed inset-0 z-[9999] md:hidden" role="dialog" aria-modal="true">
        {/* Voile sombre d'arrière-plan */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Panneau latéral droit occupant 100% de la hauteur */}
        <aside
          aria-label="Menu de navigation mobile"
          className="fixed top-0 right-0 bottom-0 z-50 h-full h-dvh w-[85%] max-w-xs sm:max-w-sm bg-background border-l border-border shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
          style={{ height: '100dvh' }}
        >
          {/* 1. En-tête du tiroir avec logo et bouton de fermeture */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-border/80 shrink-0 bg-muted/20">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2"
            >
              <Logo variant="full" size="sm" priority className="h-7 w-auto" />
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-10 h-10 rounded-xl border border-border/80 bg-card hover:bg-muted flex items-center justify-center text-foreground transition-colors focus:outline-none"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* 2. Liste épurée des liens de navigation (sans icônes) */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-3 mb-2">
              Menu principal
            </p>

            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl text-base font-semibold text-foreground hover:bg-brand-primary/10 hover:text-brand-primary transition-colors active:scale-[0.99]"
                >
                  <span>{link.label}</span>
                  {link.isHighlighted && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Gratuit
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* 3. Pied du tiroir latéral : Profil ou boutons (sans icônes) */}
          <div className="p-4 border-t border-border/80 bg-muted/20 space-y-3 shrink-0">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-background border border-border/70 space-y-0.5">
                  <p className="text-xs font-bold text-foreground truncate">
                    {userName || 'Utilisateur ACCEENT'}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {getRoleLabel()} {userEmail ? `• ${userEmail}` : ''}
                  </p>
                </div>

                <Button
                  asChild
                  size="sm"
                  className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-xs h-11 font-medium rounded-xl justify-center shadow-xs"
                >
                  <Link href={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)}>
                    Accéder à mon espace
                  </Link>
                </Button>

                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full py-1.5 text-xs text-center text-muted-foreground hover:text-destructive transition-colors font-medium"
                  >
                    Se déconnecter
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-brand-primary hover:bg-brand-secondary text-white text-xs h-11 font-semibold rounded-xl shadow-xs justify-center"
                >
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    Créer un compte gratuit
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  asChild
                  size="sm"
                  className="w-full text-xs h-11 font-semibold rounded-xl justify-center"
                >
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Connexion
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </aside>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Brand ACCEENT */}
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2"
            >
              <Logo variant="full" size="sm" priority className="h-7 sm:h-8 w-auto" />
            </Link>

            {/* Navigation Links Desktop */}
            <Suspense fallback={<NavLinksFallback />}>
              <NavLinksDesktop />
            </Suspense>

            {/* Actions / Auth Desktop (sans icônes) */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Button asChild className="bg-brand-primary hover:bg-brand-secondary text-white text-xs h-9">
                  <Link href={getDashboardLink()}>
                    Mon Espace
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="text-foreground hover:text-brand-primary text-xs h-9">
                    <Link href="/login">
                      Connexion
                    </Link>
                  </Button>
                  <Button asChild className="bg-brand-primary hover:bg-brand-secondary text-white text-xs h-9">
                    <Link href="/register">
                      S'inscrire
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Bouton Hamburger Mobile minimaliste */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground transition-colors focus:outline-none"
                aria-label="Ouvrir le menu de navigation"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Rendu du tiroir mobile via React Portal */}
      {mobileDrawer}
    </>
  );
}
