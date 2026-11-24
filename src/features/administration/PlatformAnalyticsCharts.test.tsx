import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div style={{ width: 640, height: 260 }}>{children}</div>
    ),
  };
});

import { PlatformAnalyticsCharts } from "./PlatformAnalyticsCharts";
import type { AdminDashboardStats } from "@/types";

const SAMPLE_STATS: AdminDashboardStats = {
  totalUsers: 24,
  totalBeneficiaries: 15,
  totalMentors: 5,
  totalPartners: 2,
  pendingValidations: 1,
  activePrograms: 4,
  completedSessions: 9,
  satisfactionRate: 92,
  completedProfilesCount: 18,
  totalRequestsCount: 11,
  masterclassesCount: 3,
  totalOpportunitiesCount: 6,
  demographics: {
    femalePercentage: 58,
    malePercentage: 42,
    ruralPercentage: 35,
    urbanPercentage: 65,
    sdhPercentage: 12,
    averageAge: 25,
  },
};

const EMPTY_STATS: AdminDashboardStats = {
  totalUsers: 0,
  totalBeneficiaries: 0,
  totalMentors: 0,
  totalPartners: 0,
  pendingValidations: 0,
  activePrograms: 0,
  completedSessions: 0,
  satisfactionRate: 0,
  demographics: {
    femalePercentage: 0,
    malePercentage: 0,
    ruralPercentage: 0,
    urbanPercentage: 0,
    sdhPercentage: 0,
    averageAge: 0,
  },
};

describe("PlatformAnalyticsCharts", () => {
  it("affiche les 3 titres de graphiques en mode full", () => {
    render(<PlatformAnalyticsCharts stats={SAMPLE_STATS} variant="full" />);

    expect(
      screen.getByText("Répartition des comptes par rôle")
    ).toBeTruthy();
    expect(screen.getByText("Activité de l'écosystème")).toBeTruthy();
    expect(screen.getByText("Indicateurs d'inclusion (%)")).toBeTruthy();
  });

  it("affiche les 2 graphiques principaux en mode compact sans showInclusionChart", () => {
    render(<PlatformAnalyticsCharts stats={SAMPLE_STATS} variant="compact" />);

    expect(
      screen.getByText("Répartition des comptes par rôle")
    ).toBeTruthy();
    expect(screen.getByText("Activité de l'écosystème")).toBeTruthy();
    expect(screen.queryByText("Indicateurs d'inclusion (%)")).toBeNull();
  });

  it("affiche l'état vide pour la répartition par rôle lorsque tous les compteurs sont à zéro", () => {
    render(<PlatformAnalyticsCharts stats={EMPTY_STATS} variant="full" />);

    expect(
      screen.getByText("Aucune donnée utilisateur enregistrée pour le moment.")
    ).toBeTruthy();
  });
});
