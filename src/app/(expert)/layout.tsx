import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WorkspaceLayoutShell, type WorkspaceNavItem } from "@/features/workspaces";
import { getExpertWorkspaceDataAction } from "@/lib/actions/workspace";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Espace Expert | ACCEENT Mentoring",
  description: "Interventions techniques pointues, masterclasses spécialisées et gestion de profil.",
};

export default async function ExpertSpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getExpertWorkspaceDataAction();

  if (!data) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  const navItems: WorkspaceNavItem[] = [
    {
      label: "Tableau de bord",
      href: ROUTES.EXPERT.DASHBOARD,
      icon: "dashboard",
    },
    {
      label: "Masterclasses",
      href: ROUTES.EXPERT.MASTERCLASSES,
      icon: "graduation-cap",
      badge: data.masterclasses.length > 0 ? data.masterclasses.length : undefined,
      badgeVariant: "secondary",
    },
    {
      label: "Mes Sessions",
      href: ROUTES.EXPERT.SESSIONS,
      icon: "calendar",
    },
    {
      label: "Mon Profil",
      href: ROUTES.EXPERT.PROFILE,
      icon: "user",
    },
  ];

  return (
    <WorkspaceLayoutShell
      roleLabel="Expert"
      roleBadgeClassName="bg-purple-500/20 text-purple-300 border-purple-500/30"
      headerTitle="Espace Expert"
      headerSubtitle="Interventions techniques & Masterclasses"
      headerIcon="award"
      homeHref={ROUTES.EXPERT.DASHBOARD}
      profileHref={ROUTES.EXPERT.PROFILE}
      navItems={navItems}
      user={data.user}
    >
      {children}
    </WorkspaceLayoutShell>
  );
}
