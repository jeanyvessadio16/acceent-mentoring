"use client";

import "temporal-polyfill/global";
import "@schedule-x/theme-default/dist/index.css";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { CalendarDays, Clock, ExternalLink, User, Video, X } from "lucide-react";

import type { MentorshipSessionApiItem } from "@/lib/actions/sessions";
import {
  getResolvedThemeSnapshot,
  subscribeTheme,
  type ResolvedTheme,
} from "@/lib/theme";
import { sanitizeExternalUrl } from "@/lib/utils/url-safety";
import {
  DEFAULT_CALENDAR_TIMEZONE,
  SESSION_CALENDARS,
  mapSessionsToScheduleXEvents,
} from "./schedule-x-mapper";

interface SessionsScheduleCalendarProps {
  sessions: MentorshipSessionApiItem[];
  viewerRole: "mentor" | "beneficiary";
}

function getServerThemeSnapshot(): ResolvedTheme {
  return "light";
}

const STATUS_LEGEND = [
  { key: "scheduled", label: "Planifiée", dotClass: "bg-primary" },
  { key: "rescheduled", label: "Reprogrammée", dotClass: "bg-amber-500" },
  { key: "completed", label: "Terminée", dotClass: "bg-emerald-600" },
  { key: "cancelled", label: "Annulée", dotClass: "bg-slate-400" },
];

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  SCHEDULED: {
    label: "Planifiée",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  RESCHEDULED: {
    label: "Reprogrammée",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  COMPLETED: {
    label: "Terminée",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CANCELLED: {
    label: "Annulée",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export function SessionsScheduleCalendar({
  sessions,
  viewerRole,
}: SessionsScheduleCalendarProps) {
  const resolvedTheme = useSyncExternalStore(
    subscribeTheme,
    getResolvedThemeSnapshot,
    getServerThemeSnapshot
  );

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  const calendarEvents = useMemo(
    () =>
      mapSessionsToScheduleXEvents(
        sessions,
        viewerRole,
        DEFAULT_CALENDAR_TIMEZONE
      ),
    [sessions, viewerRole]
  );

  const calendarApp = useNextCalendarApp({
    views: [
      createViewWeek(),
      createViewMonthGrid(),
      createViewDay(),
      createViewMonthAgenda(),
    ],
    defaultView: "week",
    locale: "fr-FR",
    timezone: DEFAULT_CALENDAR_TIMEZONE,
    isDark: resolvedTheme === "dark",
    calendars: SESSION_CALENDARS,
    events: calendarEvents,
    callbacks: {
      onEventClick(calendarEvent) {
        setSelectedSessionId(String(calendarEvent.id));
      },
    },
  });

  useEffect(() => {
    calendarApp?.events.set(calendarEvents);
  }, [calendarApp, calendarEvents]);

  useEffect(() => {
    calendarApp?.setTheme(resolvedTheme);
  }, [calendarApp, resolvedTheme]);

  const selectedSession = useMemo(
    () =>
      selectedSessionId
        ? sessions.find((session) => session.id === selectedSessionId) ?? null
        : null,
    [sessions, selectedSessionId]
  );

  const safeSelectedMeetingUrl = selectedSession
    ? sanitizeExternalUrl(selectedSession.meetingUrl)
    : null;

  const selectedCounterpart = selectedSession
    ? viewerRole === "mentor"
      ? selectedSession.mentee
      : selectedSession.mentor
    : null;
  const selectedCounterpartName = selectedCounterpart
    ? `${selectedCounterpart.prenom} ${selectedCounterpart.nom}`.trim()
    : viewerRole === "mentor"
    ? "Bénéficiaire"
    : "Mentor ACCEENT";

  const selectedBadge = selectedSession
    ? STATUS_LABELS[selectedSession.status] ?? STATUS_LABELS.SCHEDULED
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-primary shrink-0" />
          <span>
            {calendarEvents.length} session
            {calendarEvents.length > 1 ? "s" : ""} affichée
            {calendarEvents.length > 1 ? "s" : ""} dans l&apos;agenda (cliquez
            sur un créneau pour voir les détails)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {STATUS_LEGEND.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`} />
              <span>{item.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="sx-react-calendar-wrapper border border-border bg-card">
        <ScheduleXCalendar calendarApp={calendarApp} />
      </div>

      {selectedSession && selectedBadge && (
        <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">
                  {selectedSession.titre}
                </h4>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${selectedBadge.className}`}
                >
                  {selectedBadge.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>
                    {viewerRole === "mentor" ? "Mentoré" : "Mentor"} :{" "}
                    {selectedCounterpartName}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-secondary" />
                  <span>
                    {new Date(selectedSession.dateDebut).toLocaleString(
                      "fr-FR"
                    )}{" "}
                    –{" "}
                    {new Date(selectedSession.dateFin).toLocaleTimeString(
                      "fr-FR",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSessionId(null)}
              aria-label="Fermer les détails de la session"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {selectedSession.notes && (
            <p className="text-xs text-muted-foreground bg-card rounded-xl border border-border px-3 py-2">
              {selectedSession.notes}
            </p>
          )}

          {safeSelectedMeetingUrl && (
            <div>
              <a
                href={safeSelectedMeetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <Video className="h-3.5 w-3.5" />
                <span>Rejoindre la visioconférence</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
