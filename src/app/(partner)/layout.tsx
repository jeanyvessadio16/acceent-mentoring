import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { WorkspaceLayoutShell, type WorkspaceNavItem } from "@/features/workspaces";
import { resolveUnauthorizedWorkspaceRedirectAction } from "@/lib/actions/auth";
import { getPartnerWorkspaceDataAction } from "@/lib/actions/workspace";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Espace Partenaire | ACCEENT Mentoring",
  description: "Suivi des opportunités, indicateurs d'impact et gestion du profil partenaire.",
};

export default async function PartnerSpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const data = await getPartnerWorkspaceDataAction();

  if (!data) {
    redirect(await resolveUnauthorizedWorkspaceRedirectAction("PARTENAIRE"));
  }

  const navItems: WorkspaceNavItem[] = [
    {
      label: "Tableau de bord",
      href: ROUTES.PARTNER.DASHBOARD,
      icon: "dashboard",
    },
    {
      label: "Opportunités",
      href: ROUTES.PARTNER.OPPORTUNITIES,
      icon: "briefcase",
      badge: data.activeOpportunitiesCount > 0 ? data.activeOpportunitiesCount : undefined,
      badgeVariant: "secondary",
    },
    {
      label: "Impact & Indicateurs",
      href: ROUTES.PARTNER.IMPACT,
      icon: "bar-chart",
    },
    {
      label: "Profil & Paramètres",
      href: ROUTES.PARTNER.PROFILE,
      icon: "user",
    },
  ];

  return (
    <WorkspaceLayoutShell
      roleLabel="Partenaire"
      roleBadgeClassName="bg-teal-500/20 text-teal-300 border-teal-500/30"
      headerTitle="Espace Partenaire"
      headerSubtitle="Opportunités, Cohortes & Mesure d'impact"
      headerIcon="handshake"
      homeHref={ROUTES.PARTNER.DASHBOARD}
      profileHref={ROUTES.PARTNER.PROFILE}
      navItems={navItems}
      user={data.user}
    >
      {children}
    </WorkspaceLayoutShell>
  );
}
