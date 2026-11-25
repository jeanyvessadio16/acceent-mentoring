"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Users,
  Briefcase,
  GraduationCap,
  Calendar,
  MessageSquare,
  Route,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { signOutAction } from "@/lib/actions/auth";

interface BeneficiarySidebarProps {
  user?: {
    prenom?: string;
    nom?: string;
    email?: string;
    photoUrl?: string | null;
  } | null;
  hasCompletedDiagnosis?: boolean;
  onNavigate?: () => void;
  className?: string;
}

const BENEFICIARY_NAV_ITEMS = [
  {
    label: "Tableau de bord",
    href: ROUTES.DASHBOARDS.BENEFICIAIRE,
    icon: LayoutDashboard,
  },
  {
    label: "Mon Diagnostic",
    href: ROUTES.DASHBOARDS.DIAGNOSTIC,
    icon: Compass,
    badgeKey: "diagnostic",
  },
  {
    label: "Mon Parcours",
    href: ROUTES.BENEFICIARY.PARCOURS,
    icon: Route,
  },
  {
    label: "Mes Rendez-vous",
    href: ROUTES.BENEFICIARY.SESSIONS,
    icon: Calendar,
  },
  {
    label: "Messagerie",
    href: ROUTES.BENEFICIARY.MESSAGES,
    icon: MessageSquare,
  },
  {
    label: "Annuaire Mentors",
    href: ROUTES.BENEFICIARY.MENTORS,
    icon: Users,
  },
  {
    label: "Opportunités",
    href: ROUTES.BENEFICIARY.OPPORTUNITIES,
    icon: Briefcase,
  },
  {
    label: "Masterclasses",
    href: ROUTES.BENEFICIARY.MASTERCLASSES,
    icon: GraduationCap,
  },
  {
    label: "Profil & Paramètres",
    href: ROUTES.BENEFICIARY.PROFILE,
    icon: User,
  },
];

export function BeneficiarySidebar({
  user,
  hasCompletedDiagnosis = false,
  onNavigate,
  className,
}: BeneficiarySidebarProps) {
  const pathname = usePathname();

  const initials = `${user?.prenom?.[0] || "B"}${user?.nom?.[0] || ""}`.toUpperCase();

  return (
    <aside
      className={cn(
        "w-64 bg-sidebar text-sidebar-foreground flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-sidebar-border",
        className
      )}
    >
      <div>
        {/* En-tête : Logo plateforme & badge espace */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-sidebar-border">
          <Link
            href={ROUTES.DASHBOARDS.BENEFICIAIRE}
            onClick={onNavigate}
            className="flex items-center gap-2 focus:outline-none"
          >
            <Image
              src="/logo/Logo-violet-AccEent-Mentoring.png"
              alt="ACCEENT Mentoring"
              width={130}
              height={40}
              className="h-8 w-auto brightness-0 invert object-contain"
            />
          </Link>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-secondary/20 text-secondary border border-secondary/30">
            Bénéficiaire
          </span>
        </div>

        {/* Liens de navigation */}
        <nav className="p-3 space-y-1 mt-2">
          {BENEFICIARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === ROUTES.DASHBOARDS.BENEFICIAIRE
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-secondary text-white font-semibold shadow-xs"
                    : "text-white/75 hover:text-white hover:bg-sidebar-accent/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-white"
                        : "text-white/70 group-hover:text-white"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badgeKey === "diagnostic" && !hasCompletedDiagnosis && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-slate-950">
                    À faire
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profil utilisateur & Déconnexion */}
      <div className="p-3 border-t border-sidebar-border bg-black/20">
        <Link
          href={ROUTES.BENEFICIARY.PROFILE}
          onClick={onNavigate}
          className="px-3 py-2.5 rounded-xl bg-sidebar-accent/70 hover:bg-sidebar-accent flex items-center justify-between mb-2 transition-colors group"
          title="Consulter et modifier mon profil"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={`${user.prenom || ""} ${user.nom || ""}`.trim() || "Profil"}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-secondary/40 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary/30 text-secondary border border-secondary/40 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                {initials}
              </div>
            )}
            <div className="truncate text-left">
              <p className="text-xs font-semibold text-white truncate">
                {user ? `${user.prenom} ${user.nom}` : "Bénéficiaire"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                Mon profil · Compléter
              </p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white transition-colors" />
        </Link>

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Déconnexion</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
