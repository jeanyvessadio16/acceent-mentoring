'use client';

import React from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/client';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'BENEFICIARY' | 'MENTOR' | 'EXPERT' | 'ADMIN';
  userName?: string;
  pageTitle?: string;
}

export function DashboardLayout({
  children,
  role,
  userName: propUserName,
  pageTitle,
}: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const { userName: authUserName, userEmail } = useAuth();

  // Déterminer le vrai nom d'utilisateur connecté sans inventer de placeholder
  const effectiveUserName =
    propUserName && propUserName !== 'Chargement...' && propUserName !== 'Utilisateur ACCEENT'
      ? propUserName
      : authUserName || userEmail || propUserName || 'Mon Espace';

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar role={role} userName={effectiveUserName} />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 bg-sidebar">
            <Sidebar role={role} userName={effectiveUserName} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-background px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Ouvrir le menu latéral"
            >
              <Menu className="w-5 h-5" />
            </Button>
            {pageTitle && (
              <h1 className="text-lg font-semibold text-foreground truncate">{pageTitle}</h1>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild aria-label="Notifications" className="relative">
              <Link href={role === 'BENEFICIARY' ? '/beneficiary/notifications' : '/notifications'}>
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-primary" />
              </Link>
            </Button>
            <Link
              href={
                role === 'BENEFICIARY'
                  ? '/beneficiary/profile'
                  : role === 'MENTOR'
                  ? '/mentor/profile'
                  : '/admin/dashboard'
              }
              className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-85 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary font-bold flex items-center justify-center text-xs">
                {effectiveUserName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-foreground">
                {effectiveUserName}
              </span>
            </Link>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

