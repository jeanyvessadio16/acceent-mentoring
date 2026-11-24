import { describe, it, expect } from "vitest";
import { Temporal } from "temporal-polyfill";
import {
  DEFAULT_CALENDAR_TIMEZONE,
  getSessionCalendarId,
  mapSessionsToScheduleXEvents,
} from "./schedule-x-mapper";
import type { MentorshipSessionApiItem } from "@/lib/actions/sessions";

const BASE_SESSION: MentorshipSessionApiItem = {
  id: "sess-1",
  programId: "prog-1",
  mentorId: "m-1",
  menteeId: "b-1",
  slotId: null,
  titre: "Point stratégique Business Model",
  dateDebut: "2026-11-24T10:00:00.000Z",
  dateFin: "2026-11-24T11:30:00.000Z",
  meetingUrl: "https://meet.example.com/acceent",
  notes: "Préparer le pitch deck",
  feedback: null,
  rating: null,
  status: "SCHEDULED",
  mentor: { id: "m-1", nom: "Niox", prenom: "Fatoumata" },
  mentee: { id: "b-1", nom: "Diop", prenom: "Aminata" },
  program: { id: "prog-1", titre: "Parcours EdTech" },
};

describe("schedule-x-mapper", () => {
  it("associe chaque statut de session au bon calendarId", () => {
    expect(getSessionCalendarId("SCHEDULED")).toBe("scheduled");
    expect(getSessionCalendarId("RESCHEDULED")).toBe("rescheduled");
    expect(getSessionCalendarId("COMPLETED")).toBe("completed");
    expect(getSessionCalendarId("CANCELLED")).toBe("cancelled");
    expect(getSessionCalendarId("UNKNOWN")).toBe("scheduled");
  });

  it("convertit les sessions en événements Schedule-X avec Temporal.ZonedDateTime sur Africa/Dakar", () => {
    const mentorEvents = mapSessionsToScheduleXEvents([BASE_SESSION], "mentor");
    expect(mentorEvents).toHaveLength(1);
    const ev = mentorEvents[0];
    expect(ev.id).toBe("sess-1");
    expect(ev.title).toBe("Point stratégique Business Model");
    expect(ev.calendarId).toBe("scheduled");
    expect(ev.people).toEqual(["Aminata Diop"]);
    expect(ev.location).toBe("https://meet.example.com/acceent");
    expect(ev.description).toBe("Préparer le pitch deck");
    expect(ev.start).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(ev.end).toBeInstanceOf(Temporal.ZonedDateTime);
    expect((ev.start as Temporal.ZonedDateTime).timeZoneId).toBe(
      DEFAULT_CALENDAR_TIMEZONE
    );

    const beneficiaryEvents = mapSessionsToScheduleXEvents(
      [{ ...BASE_SESSION, status: "RESCHEDULED" }],
      "beneficiary"
    );
    expect(beneficiaryEvents[0].calendarId).toBe("rescheduled");
    expect(beneficiaryEvents[0].people).toEqual(["Fatoumata Niox"]);
  });

  it("ignore les sessions ayant des dates invalides ou dateFin <= dateDebut", () => {
    const invalidSessions: MentorshipSessionApiItem[] = [
      { ...BASE_SESSION, id: "bad-date", dateDebut: "invalid-date" },
      {
        ...BASE_SESSION,
        id: "reversed",
        dateDebut: "2026-11-24T12:00:00.000Z",
        dateFin: "2026-11-24T11:00:00.000Z",
      },
      {
        ...BASE_SESSION,
        id: "equal",
        dateDebut: "2026-11-24T12:00:00.000Z",
        dateFin: "2026-11-24T12:00:00.000Z",
      },
    ];

    expect(mapSessionsToScheduleXEvents(invalidSessions, "mentor")).toEqual([]);
  });
});
