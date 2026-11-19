"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Briefcase,
  GraduationCap,
  BarChart3,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { signOutAction } from "@/lib/actions/auth";
import type { CurrentAdminUser } from "@/lib/actions/admin";

interface AdminSidebarProps {
  pendingCount?: number;
  onNavigate?: () => void;
  className?: string;
  currentUser?: CurrentAdminUser | null;
}

const ADMIN_NAV_ITEMS = [
  {
    label: "Tableau de bord",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Validations",
    href: ROUTES.ADMIN.VALIDATIONS,
    icon: UserCheck,
    badgeKey: "validations",
  },
  {
    label: "Utilisateurs",
    href: ROUTES.ADMIN.USERS,
    icon: Users,
  },
  {
    label: "Opportunités",
    href: ROUTES.ADMIN.OPPORTUNITIES,
    icon: Briefcase,
  },
  {
    label: "Masterclasses",
    href: ROUTES.ADMIN.MASTERCLASSES,
    icon: GraduationCap,
  },
  {
    label: "Mesure d'impact",
    href: ROUTES.ADMIN.ANALYTICS,
    icon: BarChart3,
  },
  {
    label: "Mon Profil",
    href: ROUTES.ADMIN.PROFILE,
    icon: User,
  },
];

export function AdminSidebar({
  pendingCount = 0,
  onNavigate,
  className,
  currentUser,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const user = currentUser || null;

  // Nom complet d'affichage
  const displayName = (() => {
    if (!user) return "";
    const fullName = `${user.prenom || ""} ${user.nom || ""}`.trim();
    return fullName || user.email || "";
  })();

  const displayEmail = user?.email || "";

  // Initiales dynamiques
  const initials = (() => {
    if (!user) return "";
    const p = user.prenom?.trim();
    const n = user.nom?.trim();
    if (p && n) return `${p[0]}${n[0]}`.toUpperCase();
    if (p) return p.slice(0, 2).toUpperCase();
    if (n) return n.slice(0, 2).toUpperCase();
    if (user.email) return user.email.slice(0, 2).toUpperCase();
    return "";
  })();

  return (
    <aside
      className={cn(
        "w-64 bg-slate-900 text-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800",
        className
      )}
    >
      {/* Haut : Logo et badge Admin */}
      <div>
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <Link
            href={ROUTES.ADMIN.DASHBOARD}
            onClick={onNavigate}
            className="flex items-center gap-2 focus:outline-none"
          >
            <Image
              src="/logo/Logo Mentor_plateforme.png"
              alt="MentorPro ACCEENT"
              width={130}
              height={40}
              className="h-8 w-auto brightness-0 invert object-contain"
            />
          </Link>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-accent/20 text-accent border border-accent/30">
            Admin
          </span>
        </div>

        {/* Liens de navigation */}
        <nav className="p-3 space-y-1 mt-2">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === ROUTES.ADMIN.DASHBOARD
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
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badgeKey === "validations" && pendingCount > 0 && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-bold",
                      isActive
                        ? "bg-white text-secondary"
                        : "bg-accent text-slate-950 font-semibold"
                    )}
                  >
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bas : Profil administrateur et Déconnexion */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <Link
          href={ROUTES.ADMIN.PROFILE}
          onClick={onNavigate}
          className="px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 flex items-center justify-between mb-2 transition-colors group"
          title="Consulter et modifier mon profil"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-secondary/40 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary/30 text-secondary border border-secondary/40 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                {initials}
              </div>
            )}
            <div className="truncate text-left">
              <p className="text-xs font-semibold text-white truncate" title={displayName}>
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400 truncate" title={displayEmail}>
                Mon profil · Gérer
              </p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-white transition-colors shrink-0" />
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
