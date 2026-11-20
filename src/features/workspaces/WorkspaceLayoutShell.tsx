"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Sparkles,
  Calendar,
  Clock,
  User,
  GraduationCap,
  Briefcase,
  BarChart3,
  Award,
  Handshake,
  Users,
  MessageSquare,
  LogOut,
  Menu,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/actions/auth";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { ThemeToggle } from "@/components/theme";

export type WorkspaceIconKey =
  | "dashboard"
  | "inbox"
  | "sparkles"
  | "calendar"
  | "clock"
  | "user"
  | "graduation-cap"
  | "briefcase"
  | "bar-chart"
  | "award"
  | "handshake"
  | "users"
  | "message-square";

const ICON_MAP: Record<WorkspaceIconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  inbox: Inbox,
  sparkles: Sparkles,
  calendar: Calendar,
  clock: Clock,
  user: User,
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
  "bar-chart": BarChart3,
  award: Award,
  handshake: Handshake,
  users: Users,
  "message-square": MessageSquare,
};

export interface WorkspaceNavItem {
  label: string;
  href: string;
  icon: WorkspaceIconKey;
  badge?: number | string;
  badgeVariant?: "accent" | "secondary";
}

interface WorkspaceUserInfo {
  prenom?: string;
  nom?: string;
  email?: string;
  photoUrl?: string | null;
}

interface WorkspaceLayoutShellProps {
  roleLabel: string;
  roleBadgeClassName: string;
  headerTitle: string;
  headerSubtitle: string;
  headerIcon: WorkspaceIconKey;
  homeHref: string;
  profileHref: string;
  navItems: WorkspaceNavItem[];
  user: WorkspaceUserInfo | null;
  children: React.ReactNode;
}

interface WorkspaceSidebarContentProps {
  roleLabel: string;
  roleBadgeClassName: string;
  homeHref: string;
  profileHref: string;
  navItems: WorkspaceNavItem[];
  user: WorkspaceUserInfo | null;
  onNavigate?: () => void;
  className?: string;
}

function WorkspaceSidebarContent({
  roleLabel,
  roleBadgeClassName,
  homeHref,
  profileHref,
  navItems,
  user,
  onNavigate,
  className,
}: WorkspaceSidebarContentProps) {
  const pathname = usePathname();

  const fullName = `${user?.prenom || ""} ${user?.nom || ""}`.trim();
  const displayName = fullName || user?.email?.split("@")[0] || roleLabel;
  const initials = (() => {
    const p = user?.prenom?.trim();
    const n = user?.nom?.trim();
    if (p && n) return `${p[0]}${n[0]}`.toUpperCase();
    if (p) return p.slice(0, 2).toUpperCase();
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return roleLabel.slice(0, 2).toUpperCase();
  })();

  return (
    <aside
      className={cn(
        "w-64 bg-slate-900 text-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800",
        className
      )}
    >
      <div>
        {/* En-tête : Logo & badge d'espace */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <Link
            href={homeHref}
            onClick={onNavigate}
            className="flex items-center gap-2 focus:outline-none"
          >
            <Image
              src="/logo/Logo Mentor_plateforme.png"
              alt="ACCEENT MentorPro"
              width={130}
              height={40}
              className="h-8 w-auto brightness-0 invert object-contain"
            />
          </Link>
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border",
              roleBadgeClassName
            )}
          >
            {roleLabel}
          </span>
        </div>

        {/* Liens de navigation intra-espace */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon] || LayoutDashboard;
            const isActive =
              item.href === homeHref
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
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-white"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge !== null && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold",
                      isActive
                        ? "bg-white text-secondary"
                        : item.badgeVariant === "secondary"
                        ? "bg-secondary/20 text-secondary"
                        : "bg-accent text-slate-950"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profil utilisateur cliquable & Déconnexion */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <Link
          href={profileHref}
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
              <p className="text-xs font-semibold text-white truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
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

export function WorkspaceLayoutShell({
  roleLabel,
  roleBadgeClassName,
  headerTitle,
  headerSubtitle,
  headerIcon,
  homeHref,
  profileHref,
  navItems,
  user,
  children,
}: WorkspaceLayoutShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const HeaderIcon = ICON_MAP[headerIcon] || LayoutDashboard;
  const initials = (() => {
    const p = user?.prenom?.trim();
    const n = user?.nom?.trim();
    if (p && n) return `${p[0]}${n[0]}`.toUpperCase();
    if (p) return p.slice(0, 2).toUpperCase();
    return roleLabel.slice(0, 2).toUpperCase();
  })();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Desktop fixe */}
      <WorkspaceSidebarContent
        roleLabel={roleLabel}
        roleBadgeClassName={roleBadgeClassName}
        homeHref={homeHref}
        profileHref={profileHref}
        navItems={navItems}
        user={user}
        className="hidden md:flex"
      />

      {/* Colonne principale */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          data-dashboard-surface
          className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Ouvrir le menu de navigation"
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted focus:outline-none"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-secondary/10 text-secondary">
                <HeaderIcon className="h-3.5 w-3.5" />
                <span>{headerTitle}</span>
              </span>
              <span className="hidden sm:inline-block text-xs text-muted-foreground">
                · {headerSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <Link
              href={profileHref}
              className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-80 transition-opacity"
              title="Accéder à mon profil"
            >
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.prenom || "Mon Profil"}
                  className="w-8 h-8 rounded-full object-cover shadow-xs border border-secondary/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-secondary text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {initials}
                </div>
              )}
              <span className="hidden md:inline-block text-xs font-semibold text-foreground">
                {user?.prenom || "Mon Profil"}
              </span>
            </Link>
          </div>
        </header>

        <main
          data-dashboard-surface
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6"
        >
          {children}
        </main>
      </div>

      {/* Drawer mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
            <WorkspaceSidebarContent
              roleLabel={roleLabel}
              roleBadgeClassName={roleBadgeClassName}
              homeHref={homeHref}
              profileHref={profileHref}
              navItems={navItems}
              user={user}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
