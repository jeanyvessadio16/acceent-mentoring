"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Menu,
  X,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { ROUTES } from "@/lib/constants";
import type { CurrentAdminUser } from "@/lib/actions/admin";

interface AdminHeaderProps {
  pendingCount?: number;
  currentUser?: CurrentAdminUser | null;
}

export function AdminHeader({ pendingCount = 4, currentUser }: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* Bouton burger mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Ouvrir le menu de navigation"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
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

        {/* Côté droit : Recherche rapide, notifications, lien plateforme */}
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.HOME}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
          >
            <span>Voir le site public</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          {/* Cloche de notifications */}
          <Link
            href={ROUTES.ADMIN.VALIDATIONS}
            className="relative p-2 rounded-full text-slate-600 hover:text-primary hover:bg-slate-100 transition-colors"
            aria-label={`${pendingCount} validations en attente`}
          >
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-accent text-[10px] font-bold text-slate-950 rounded-full flex items-center justify-center animate-pulse">
                {pendingCount}
              </span>
            )}
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
