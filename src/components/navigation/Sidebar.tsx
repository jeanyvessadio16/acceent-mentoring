'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Compass,
  Calendar,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Settings,
  ShieldCheck,
  Award,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/features/auth/actions';

interface SidebarProps {
  role: 'BENEFICIARY' | 'MENTOR' | 'EXPERT' | 'ADMIN';
  userName?: string;
}

interface MenuItem {
  href: string;
  label: string;
  icon: any;
}

function SidebarNavList({ menuItems }: { menuItems: MenuItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="p-4 space-y-1">
      {menuItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-brand-primary text-white font-semibold'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand-primary'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarNavFallback({ menuItems }: { menuItems: MenuItem[] }) {
  return (
    <nav className="p-4 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand-primary"
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ role, userName }: SidebarProps) {
  const getMenuItems = (): MenuItem[] => {
    if (role === 'ADMIN') {
      return [
        { href: '/admin/dashboard', label: 'Vue Globale', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Gestion Utilisateurs', icon: Users },
        { href: '/admin/mentors-validation', label: 'Validation Mentors', icon: ShieldCheck },
        { href: '/admin/opportunities', label: 'Opportunités', icon: Briefcase },
        { href: '/admin/statistics', label: 'Statistiques & Impact', icon: Award },
        { href: '/admin/settings', label: 'Configuration', icon: Settings },
      ];
    }

    if (role === 'MENTOR' || role === 'EXPERT') {
      return [
        { href: '/mentor/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { href: '/mentor/requests', label: 'Demandes reçues', icon: Users },
        { href: '/mentor/journey', label: 'Suivi des mentorés', icon: Award },
        { href: '/mentor/sessions', label: 'Mon Agenda & Sessions', icon: Calendar },
        { href: '/mentor/messages', label: 'Messagerie', icon: MessageSquare },
        { href: '/mentor/profile', label: 'Mon Profil Mentor', icon: Settings },
      ];
    }

    // Default: BENEFICIARY
    return [
      { href: '/beneficiary/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { href: '/beneficiary/diagnostic', label: 'Mon Diagnostic', icon: Compass },
      { href: '/beneficiary/mentors', label: 'Trouver un Mentor', icon: Users },
      { href: '/beneficiary/journey', label: 'Mon Parcours', icon: Award },
      { href: '/beneficiary/sessions', label: 'Mes Rendez-vous', icon: Calendar },
      { href: '/beneficiary/messages', label: 'Messagerie', icon: MessageSquare },
      { href: '/beneficiary/opportunites', label: 'Opportunités', icon: Briefcase },
      { href: '/beneficiary/masterclasses', label: 'Masterclasses', icon: GraduationCap },
      { href: '/beneficiary/profile', label: 'Mon Profil', icon: Settings },
    ];
  };

  const menuItems = getMenuItems();
  const homeHref =
    role === 'ADMIN'
      ? '/admin/dashboard'
      : role === 'MENTOR'
      ? '/mentor/dashboard'
      : '/beneficiary/dashboard';

  return (
    <aside className="w-64 border-r border-border bg-sidebar h-screen sticky top-0 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link href={homeHref} className="flex items-center gap-2">
            <span className="font-bold text-xl text-brand-primary">ACCEENT</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary">
              {role === 'ADMIN' ? 'Admin' : role === 'MENTOR' ? 'Mentor' : 'Espace'}
            </span>
          </Link>
        </div>

        {/* User banner */}
        {userName && (
          <div className="px-6 py-4 border-b border-sidebar-border/50">
            <p className="text-xs text-muted-foreground">Connecté en tant que</p>
            <p className="text-sm font-semibold truncate text-foreground">{userName}</p>
          </div>
        )}

        {/* Navigation items with Suspense */}
        <Suspense fallback={<SidebarNavFallback menuItems={menuItems} />}>
          <SidebarNavList menuItems={menuItems} />
        </Suspense>
      </div>

      {/* Footer / Logout via Server Action */}
      <div className="p-4 border-t border-sidebar-border">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer text-xs"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </form>
      </div>
    </aside>
  );
}
