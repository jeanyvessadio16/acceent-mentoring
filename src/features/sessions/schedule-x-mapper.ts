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
      main: "#0B1026",
      container: "#E8ECF4",
      onContainer: "#0B1026",
    },
    darkColors: {
      main: "#D6A8D0",
      container: "#1A2444",
      onContainer: "#FFFFFF",
    },
  },
  rescheduled: {
    colorName: "rescheduled",
    label: "Reprogrammée",
    lightColors: {
      main: "#836182",
      container: "#F5EBF3",
      onContainer: "#0B1026",
    },
    darkColors: {
      main: "#D6A8D0",
      container: "#3B283A",
      onContainer: "#FFFFFF",
    },
  },
  completed: {
    colorName: "completed",
    label: "Terminée",
    lightColors: {
      main: "#16A36A",
      container: "#DCFCE7",
      onContainer: "#14532D",
    },
    darkColors: {
      main: "#4ADE80",
      container: "#14532D",
      onContainer: "#ECFDF5",
    },
  },
  cancelled: {
    colorName: "cancelled",
    label: "Annulée",
    lightColors: {
      main: "#45556C",
      container: "#E2E6EE",
      onContainer: "#0B1026",
    },
    darkColors: {
      main: "#B8C2D1",
      container: "#1A2444",
      onContainer: "#FFFFFF",
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
