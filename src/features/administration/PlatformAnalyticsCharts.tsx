"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminDashboardStats } from "@/types";

interface PlatformAnalyticsChartsProps {
  stats: AdminDashboardStats;
  variant?: "full" | "compact";
  showInclusionChart?: boolean;
}

const emptySubscribe = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

const TOOLTIP_CONTENT_STYLE: CSSProperties = {
  backgroundColor: "var(--card)",
  borderColor: "var(--border)",
  color: "var(--foreground)",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
};

const TOOLTIP_ITEM_STYLE: CSSProperties = {
  color: "var(--foreground)",
};

const TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: "var(--muted-foreground)",
  fontWeight: 600,
  marginBottom: "2px",
};

function ChartPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="h-[260px] w-full rounded-xl bg-muted/40 animate-pulse"
    />
  );
}

export function PlatformAnalyticsCharts({
  stats,
  variant = "compact",
  showInclusionChart = false,
}: PlatformAnalyticsChartsProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientMounted,
    getServerMounted
  );

  const otherUsers = Math.max(
    0,
    stats.totalUsers -
      stats.totalBeneficiaries -
      stats.totalMentors -
      stats.totalPartners
  );

  const roleData = [
    {
      name: "Bénéficiaires",
      value: stats.totalBeneficiaries,
      color: "var(--chart-1)",
    },
    {
      name: "Mentors",
      value: stats.totalMentors,
      color: "var(--chart-2)",
    },
    {
      name: "Partenaires",
      value: stats.totalPartners,
      color: "var(--chart-3)",
    },
    ...(otherUsers > 0
      ? [
          {
            name: "Autres (Experts / Admin)",
            value: otherUsers,
            color: "var(--chart-4)",
          },
        ]
      : []),
  ].filter((item) => item.value > 0);

  const activityData =
    variant === "full"
      ? [
          { label: "Utilisateurs", value: stats.totalUsers },
          { label: "Profils", value: stats.completedProfilesCount ?? 0 },
          { label: "Demandes", value: stats.totalRequestsCount ?? 0 },
          { label: "Parcours", value: stats.activePrograms },
          { label: "Sessions", value: stats.completedSessions },
          { label: "Masterclasses", value: stats.masterclassesCount ?? 0 },
          { label: "Opportunités", value: stats.totalOpportunitiesCount ?? 0 },
        ]
      : [
          { label: "Bénéficiaires", value: stats.totalBeneficiaries },
          { label: "Mentors", value: stats.totalMentors },
          { label: "Parcours actifs", value: stats.activePrograms },
          { label: "Sessions", value: stats.completedSessions },
        ];

  const inclusionData = [
    {
      label: "Femmes",
      value: stats.demographics.femalePercentage,
      color: "var(--chart-2)",
    },
    {
      label: "Hommes",
      value: stats.demographics.malePercentage,
      color: "var(--chart-1)",
    },
    {
      label: "Zone rurale",
      value: stats.demographics.ruralPercentage,
      color: "var(--chart-3)",
    },
    {
      label: "Zone urbaine",
      value: stats.demographics.urbanPercentage,
      color: "var(--chart-4)",
    },
    {
      label: "SDH inclus",
      value: stats.demographics.sdhPercentage,
      color: "var(--chart-5)",
    },
  ];

  const shouldRenderInclusion = variant === "full" || showInclusionChart;

  return (
    <div
      className={`grid grid-cols-1 gap-6 ${
        shouldRenderInclusion ? "lg:grid-cols-3" : "lg:grid-cols-2"
      }`}
    >
      {/* 1. Répartition des comptes par rôle */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground">
            Répartition des comptes par rôle
          </h3>
          <p className="text-xs text-muted-foreground">
            Distribution des comptes actifs par profil sur la plateforme.
          </p>
        </div>

        {roleData.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center">
            <p className="text-xs text-muted-foreground">
              Aucune donnée utilisateur enregistrée pour le moment.
            </p>
          </div>
        ) : !isMounted ? (
          <ChartPlaceholder />
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {roleData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 2. Activité de l'écosystème */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground">
            Activité de l&apos;écosystème
          </h3>
          <p className="text-xs text-muted-foreground">
            Volume réel des interactions et accompagnements enregistrés.
          </p>
        </div>

        {!isMounted ? (
          <ChartPlaceholder />
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityData}
                margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                />
                <Bar
                  dataKey="value"
                  name="Total"
                  fill="var(--chart-2)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 3. Indicateurs d'inclusion (%) */}
      {shouldRenderInclusion && (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-foreground">
              Indicateurs d&apos;inclusion (%)
            </h3>
            <p className="text-xs text-muted-foreground">
              Parité, représentativité rurale et inclusion SDH.
            </p>
          </div>

          {!isMounted ? (
            <ChartPlaceholder />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={inclusionData}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 4, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={110}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                    contentStyle={TOOLTIP_CONTENT_STYLE}
                    itemStyle={TOOLTIP_ITEM_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                    formatter={(value) =>
                      typeof value === "number" ? `${value}%` : String(value ?? "")
                    }
                  />
                  <Bar
                    dataKey="value"
                    name="Part"
                    radius={[0, 8, 8, 0]}
                  >
                    {inclusionData.map((entry) => (
                      <Cell key={entry.label} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
