import { Temporal } from "temporal-polyfill";
import type { CalendarEventExternal, CalendarType } from "@schedule-x/calendar";
import type { MentorshipSessionApiItem } from "@/lib/actions/sessions";

export const DEFAULT_CALENDAR_TIMEZONE = "Africa/Dakar" as const;

export type SessionCalendarId =
  | "scheduled"
  | "rescheduled"
  | "completed"
  | "cancelled";

export const SESSION_CALENDARS: Record<SessionCalendarId, CalendarType> = {
  scheduled: {
    colorName: "scheduled",
    label: "Planifiée",
    lightColors: {
      main: "#142B4A",
      container: "#DBEAFE",
      onContainer: "#142B4A",
    },
    darkColors: {
      main: "#60A5FA",
      container: "#1E3A5F",
      onContainer: "#EFF6FF",
    },
  },
  rescheduled: {
    colorName: "rescheduled",
    label: "Reprogrammée",
    lightColors: {
      main: "#D97706",
      container: "#FEF3C7",
      onContainer: "#78350F",
    },
    darkColors: {
      main: "#F2A541",
      container: "#452A0A",
      onContainer: "#FEF3C7",
    },
  },
  completed: {
    colorName: "completed",
    label: "Terminée",
    lightColors: {
      main: "#159B78",
      container: "#D1FAE5",
      onContainer: "#064E3B",
    },
    darkColors: {
      main: "#34D399",
      container: "#0B3B2E",
      onContainer: "#ECFDF5",
    },
  },
  cancelled: {
    colorName: "cancelled",
    label: "Annulée",
    lightColors: {
      main: "#64748B",
      container: "#E2E8F0",
      onContainer: "#334155",
    },
    darkColors: {
      main: "#94A3B8",
      container: "#1E293B",
      onContainer: "#CBD5E1",
    },
  },
};

export function getSessionCalendarId(status: string): SessionCalendarId {
  switch (status) {
    case "RESCHEDULED":
      return "rescheduled";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    default:
      return "scheduled";
  }
}

function toZonedDateTime(
  isoValue: string,
  timezone: (typeof DEFAULT_CALENDAR_TIMEZONE) | Parameters<Temporal.Instant["toZonedDateTimeISO"]>[0]
): Temporal.ZonedDateTime | null {
  if (!isoValue || typeof isoValue !== "string") {
    return null;
  }
  const timestamp = Date.parse(isoValue);
  if (!Number.isFinite(timestamp)) {
    return null;
  }
  try {
    return Temporal.Instant.fromEpochMilliseconds(timestamp).toZonedDateTimeISO(
      timezone
    );
  } catch {
    return null;
  }
}

export function mapSessionsToScheduleXEvents(
  sessions: MentorshipSessionApiItem[],
  viewerRole: "mentor" | "beneficiary",
  timezone: typeof DEFAULT_CALENDAR_TIMEZONE | string = DEFAULT_CALENDAR_TIMEZONE
): CalendarEventExternal[] {
  const events: CalendarEventExternal[] = [];

  for (const session of sessions) {
    const start = toZonedDateTime(session.dateDebut, timezone);
    const end = toZonedDateTime(session.dateFin, timezone);

    if (!start || !end) {
      continue;
    }

    if (Temporal.ZonedDateTime.compare(end, start) <= 0) {
      continue;
    }

    const counterpart =
      viewerRole === "mentor" ? session.mentee : session.mentor;
    const counterpartName = counterpart
      ? `${counterpart.prenom} ${counterpart.nom}`.trim()
      : viewerRole === "mentor"
      ? "Bénéficiaire"
      : "Mentor ACCEENT";

    events.push({
      id: session.id,
      title: session.titre || "Session de mentoring",
      start,
      end,
      calendarId: getSessionCalendarId(session.status),
      people: counterpartName ? [counterpartName] : undefined,
      location: session.meetingUrl || undefined,
      description: session.notes || undefined,
    });
  }

  return events;
}
