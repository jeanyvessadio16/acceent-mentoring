"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { ThemeToggle } from "@/components/theme";
import { ROUTES } from "@/lib/constants";
import type { CurrentAdminUser } from "@/lib/actions/admin";

interface AdminHeaderProps {
  pendingCount?: number;
  currentUser?: CurrentAdminUser | null;
}

export function AdminHeader({ pendingCount = 0, currentUser }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        data-dashboard-surface
        className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30"
      >
        <div className="flex items-center gap-3">
          {/* Bouton burger mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Ouvrir le menu de navigation"
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted focus:outline-none"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary">
              <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
              <span>Console d&apos;Administration</span>
            </span>
            <span className="hidden sm:inline-block text-xs text-muted-foreground">
              · Région Sénégal & Afrique de l&apos;Ouest
            </span>
          </div>
        </div>

        {/* Côté droit : Recherche rapide, notifications, lien plateforme, profil */}
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.HOME}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted"
          >
            <span>Voir le site public</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          <ThemeToggle />
          <NotificationBell />

          <Link
            href={ROUTES.ADMIN.PROFILE}
            className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-80 transition-opacity"
            title="Accéder à mon profil administrateur"
          >
            {currentUser?.photoUrl ? (
              <img
                src={currentUser.photoUrl}
                alt={`${currentUser.prenom || "Admin"} ${currentUser.nom || ""}`.trim()}
                className="w-8 h-8 rounded-full object-cover shadow-xs border border-secondary/40"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {`${currentUser?.prenom?.[0] || "A"}${currentUser?.nom?.[0] || "D"}`.toUpperCase()}
              </div>
            )}
            <span className="hidden md:inline-block text-xs font-semibold text-foreground">
              {currentUser?.prenom || "Admin"}
            </span>
          </Link>
        </div>
      </header>

      {/* Drawer mobile pour la sidebar admin */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
            <AdminSidebar
              pendingCount={pendingCount}
              currentUser={currentUser}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
