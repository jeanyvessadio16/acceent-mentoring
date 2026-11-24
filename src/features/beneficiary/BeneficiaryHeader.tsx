"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Compass,
} from "lucide-react";
import { BeneficiarySidebar } from "./BeneficiarySidebar";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { ThemeToggle } from "@/components/theme";
import { ROUTES } from "@/lib/constants";

interface BeneficiaryHeaderProps {
  user?: {
    prenom?: string;
    nom?: string;
    email?: string;
    photoUrl?: string | null;
  } | null;
  hasCompletedDiagnosis?: boolean;
}

export function BeneficiaryHeader({
  user,
  hasCompletedDiagnosis = false,
}: BeneficiaryHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        data-dashboard-surface
        className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30"
      >
        <div className="flex items-center gap-3">
          {/* Burger menu mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Ouvrir le menu de navigation"
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted focus:outline-none"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Côté droit */}
        <div className="flex items-center gap-3">
          {!hasCompletedDiagnosis && (
            <Link
              href={ROUTES.DASHBOARDS.DIAGNOSTIC}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-accent/20 text-accent-foreground border border-accent/40 hover:bg-accent/30 transition-colors"
            >
              <Compass className="h-3.5 w-3.5 text-accent" />
              <span>Compléter mon diagnostic</span>
            </Link>
          )}

          <ThemeToggle />
          <NotificationBell />

          <Link
            href={ROUTES.BENEFICIARY.PROFILE}
            className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-80 transition-opacity"
            title="Accéder à mon profil"
          >
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={`${user.prenom || ""} ${user.nom || ""}`.trim() || "Mon Profil"}
                className="w-8 h-8 rounded-full object-cover shadow-xs border border-secondary/40"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {`${user?.prenom?.[0] || "B"}${user?.nom?.[0] || ""}`.toUpperCase()}
              </div>
            )}
            <span className="hidden md:inline-block text-xs font-semibold text-foreground">
              {user?.prenom || "Mon Profil"}
            </span>
          </Link>
        </div>
      </header>

      {/* Drawer mobile pour la sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
            <BeneficiarySidebar
              user={user}
              hasCompletedDiagnosis={hasCompletedDiagnosis}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
