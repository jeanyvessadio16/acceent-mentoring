import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { WorkspaceLayoutShell, type WorkspaceNavItem } from "@/features/workspaces";
import { getMentorWorkspaceDataAction } from "@/lib/actions/workspace";
import { ROUTES } from "@/lib/constants";

export const instant = false;

export const metadata: Metadata = {
  title: "Espace Mentor | ACCEENT Mentoring",
  description: "Supervisez vos demandes de mentoring, vos mentorés, votre agenda et votre profil.",
};

export default async function MentorSpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const data = await getMentorWorkspaceDataAction();

  if (!data) {
    redirect(ROUTES.AUTH.LOGIN);
  }

  const navItems: WorkspaceNavItem[] = [
    {
      label: "Tableau de bord",
      href: ROUTES.MENTOR.DASHBOARD,
      icon: "dashboard",
    },
    {
      label: "Demandes reçues",
      href: ROUTES.MENTOR.REQUESTS,
      icon: "inbox",
      badge: data.pendingRequestsCount > 0 ? data.pendingRequestsCount : undefined,
      badgeVariant: "accent",
    },
    {
      label: "Mes Mentorés",
      href: ROUTES.MENTOR.PARCOURS,
      icon: "sparkles",
    },
    {
      label: "Agenda & Sessions",
      href: ROUTES.MENTOR.CALENDAR,
      icon: "calendar",
    },
    {
      label: "Messagerie",
      href: ROUTES.MENTOR.MESSAGES,
      icon: "message-square",
    },
    {
      label: "Ma Candidature",
      href: ROUTES.MENTOR.APPLICATION,
      icon: "clock",
      badge:
        data.mentorProfile?.statutValidation === "PENDING"
          ? "En cours"
          : undefined,
    },
    {
      label: "Profil & Paramètres",
      href: ROUTES.MENTOR.PROFILE,
      icon: "user",
    },
  ];

  return (
    <WorkspaceLayoutShell
      roleLabel="Mentor"
      roleBadgeClassName="bg-blue-500/20 text-blue-300 border-blue-500/30"
      homeHref={ROUTES.MENTOR.DASHBOARD}
      profileHref={ROUTES.MENTOR.PROFILE}
      navItems={navItems}
      user={data.user}
    >
      {children}
    </WorkspaceLayoutShell>
  );
}
