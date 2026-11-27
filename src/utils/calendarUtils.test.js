import {
  parseRomanianDateTime,
  formatICSDate,
  escapeICSText,
  foldICSLine,
  buildICSContent,
  createGoogleCalendarUrl,
  safeFileName
} from "./calendarUtils";
import { computeReminderDelay, scheduleShowReminder, cancelAllReminders } from "./reminders";

describe("parseRomanianDateTime", () => {
  it("interpretează data românească și ora proiecției", () => {
    const { startDate, endDate } = parseRomanianDateTime("Sâmbătă, 28 Noiembrie 2026", "19:30");
    expect(startDate.getFullYear()).toBe(2026);
    expect(startDate.getMonth()).toBe(10);
    expect(startDate.getDate()).toBe(28);
    expect(startDate.getHours()).toBe(19);
    expect(startDate.getMinutes()).toBe(30);
    expect(endDate.getTime() - startDate.getTime()).toBe(150 * 60 * 1000);
  });

  it("nu depinde de majuscule și acceptă date fără ziua săptămânii", () => {
    const { startDate } = parseRomanianDateTime("3 decembrie 2026", "12:00");
    expect(startDate.getMonth()).toBe(11);
    expect(startDate.getDate()).toBe(3);
  });
});

describe("ICS", () => {
  const start = new Date(Date.UTC(2026, 10, 28, 17, 0, 0));
  const end = new Date(start.getTime() + 150 * 60 * 1000);

  it("formatează datele în UTC fără separatori", () => {
    expect(formatICSDate(start)).toBe("20261128T170000Z");
  });

  it("escapează caracterele speciale", () => {
    expect(escapeICSText("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
  });

  it("împarte liniile lungi în segmente de maximum 75 de octeți", () => {
    const folded = foldICSLine(`DESCRIPTION:${"ă".repeat(120)}`);
    folded.split("\r\n").forEach((line) => {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    });
    expect(folded.replace(/\r\n /g, "")).toBe(`DESCRIPTION:${"ă".repeat(120)}`);
  });

  it("generează un eveniment complet cu UID, DTSTAMP și alarmă cu o oră înainte", () => {
    const ics = buildICSContent("Dune (IMAX)", "Locuri: R4L6, R4L7\nVizionare plăcută!", "Brașov, Corpul N", start, end, {
      uid: "NIII7-1@cinema-niii7.local",
      now: new Date(Date.UTC(2026, 10, 27, 10, 0, 0))
    });
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("UID:NIII7-1@cinema-niii7.local");
    expect(ics).toContain("DTSTAMP:20261127T100000Z");
    expect(ics).toContain("DTSTART:20261128T170000Z");
    expect(ics).toContain("DTEND:20261128T193000Z");
    expect(ics).toContain("TRIGGER:-PT1H");
    expect(ics).toContain("LOCATION:Brașov\\, Corpul N");
    expect(ics).toContain("Locuri: R4L6\\, R4L7\\nVizionare");
  });

  it("construiește link-ul Google Calendar cu perioada corectă", () => {
    const url = new URL(createGoogleCalendarUrl("Dune", "desc", "Brașov", start, end));
    expect(url.origin).toBe("https://calendar.google.com");
    expect(url.searchParams.get("dates")).toBe("20261128T170000Z/20261128T193000Z");
  });
});

describe("safeFileName", () => {
  it("elimină diacriticele și caracterele nepermise", () => {
    expect(safeFileName("Spider-Man: Across the Spider-Verse")).toBe("Spider-Man_Across_the_Spider-Verse");
    expect(safeFileName("Brașov / Șoc?")).toBe("Brasov_Soc");
  });
});

describe("remindere", () => {
  afterEach(() => cancelAllReminders());

  it("calculează întârzierea față de ora de început minus o oră", () => {
    const now = Date.UTC(2026, 10, 28, 10, 0, 0);
    const start = new Date(Date.UTC(2026, 10, 28, 17, 0, 0));
    expect(computeReminderDelay(start, now)).toBe(6 * 60 * 60 * 1000);
  });

  it("programează o singură dată și anunță imediat dacă filmul începe în mai puțin de o oră", () => {
    const now = Date.UTC(2026, 10, 28, 10, 0, 0);
    const notify = vi.fn();

    const far = scheduleShowReminder("t1", new Date(now + 5 * 3600 * 1000), notify, now);
    expect(far.status).toBe("scheduled");
    expect(scheduleShowReminder("t1", new Date(now + 5 * 3600 * 1000), notify, now).status).toBe("already");

    const soon = scheduleShowReminder("t2", new Date(now + 30 * 60 * 1000), notify, now);
    expect(soon.status).toBe("sent-now");
    expect(notify).toHaveBeenCalledTimes(1);

    expect(scheduleShowReminder("t3", new Date(now - 1000), notify, now).status).toBe("past");
  });
});
