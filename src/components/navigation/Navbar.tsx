'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Compass, 
  Users, 
  Briefcase, 
  GraduationCap, 
  Menu, 
  X,
  LogIn,
  UserPlus
} from 'lucide-react';

import { useAuth } from '@/lib/auth/client';

interface NavbarProps {
  isAuthenticated?: boolean;
  userRole?: string;
}

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/mentors', label: 'Trouver un Mentor', icon: Users },
  { href: '/opportunites', label: 'Opportunités', icon: Briefcase },
  { href: '/masterclasses', label: 'Masterclasses', icon: GraduationCap },
  { href: '/diagnostic', label: 'Diagnostic', icon: Compass },
];

function NavLinksDesktop() {
  const pathname = usePathname();
  return (
    <div className="hidden md:flex items-center gap-6">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors hover:text-brand-primary ${
              isActive ? 'text-brand-primary font-semibold' : 'text-foreground/80'
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
      {navLinks.map((link) => (
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
  const { isAuthenticated: clientIsAuth, role: clientRole } = useAuth();
  const isAuthenticated = propIsAuth ?? clientIsAuth;
  const userRole = propRole ?? clientRole;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const getDashboardLink = () => {
    switch (userRole) {
      case 'MENTOR':
      case 'EXPERT':
        return '/mentor/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/beneficiary/dashboard';
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand ACCEENT */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-2xl tracking-tight text-brand-primary">
                ACCEENT
              </span>
              <span className="hidden sm:inline-block text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-secondary text-brand-primary">
                Mentoring
              </span>
            </Link>
          </div>

          {/* Navigation Links Desktop with Suspense boundary */}
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinksDesktop />
          </Suspense>

          {/* Actions / Auth Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button asChild className="bg-brand-primary hover:bg-brand-secondary text-white">
                <Link href={getDashboardLink()}>
                  Mon Espace
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-foreground hover:text-brand-primary">
                  <Link href="/login" className="flex items-center gap-1.5">
                    <LogIn className="w-4 h-4" />
                    Connexion
                  </Link>
                </Button>
                <Button asChild className="bg-brand-primary hover:bg-brand-secondary text-white">
                  <Link href="/register" className="flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    S'inscrire
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Ouvrir le menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium rounded-md hover:bg-secondary hover:text-brand-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <Button asChild className="w-full bg-brand-primary hover:bg-brand-secondary text-white">
                <Link href={getDashboardLink()} onClick={() => setIsMobileMenuOpen(false)}>
                  Mon Espace
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild className="w-full justify-center">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Connexion
                  </Link>
                </Button>
                <Button asChild className="w-full justify-center bg-brand-primary hover:bg-brand-secondary text-white">
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    S'inscrire
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
