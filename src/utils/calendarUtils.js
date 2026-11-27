const MONTHS_MAP = {
  ianuarie: 0, februarie: 1, martie: 2, aprilie: 3,
  mai: 4, iunie: 5, iulie: 6, august: 7,
  septembrie: 8, octombrie: 9, noiembrie: 10, decembrie: 11
};

export const SHOW_DURATION_MINUTES = 150;

export function parseRomanianDateTime(dateStr, timeStr) {
  const raw = String(dateStr ?? "");
  const afterComma = raw.includes(",") ? raw.split(",").slice(1).join(",").trim() : raw.trim();
  const parts = afterComma.split(/\s+/);
  const now = new Date();
  const day = parseInt(parts[0], 10) || now.getDate();
  const monthKey = (parts[1] || "").toLowerCase();
  const month = MONTHS_MAP[monthKey] ?? now.getMonth();
  const year = parseInt(parts[2], 10) || now.getFullYear();
  const [hours, minutes] = String(timeStr ?? "").split(":").map((n) => parseInt(n, 10) || 0);

  const startDate = new Date(year, month, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + SHOW_DURATION_MINUTES * 60 * 1000);
  return { startDate, endDate };
}

export function formatICSDate(date) {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export function escapeICSText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function foldICSLine(line) {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const chunks = [];
  let current = "";
  let currentBytes = 0;
  let limit = 75;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (currentBytes + size > limit) {
      chunks.push(current);
      current = char;
      currentBytes = size;
      limit = 74;
    } else {
      current += char;
      currentBytes += size;
    }
  }
  if (current) chunks.push(current);
  return chunks.join("\r\n ");
}

export function buildICSContent(
  title,
  desc,
  location,
  startDate,
  endDate,
  { uid, now = new Date() } = {}
) {
  const eventUid = uid || `${formatICSDate(startDate)}-${Math.abs(hashText(title))}@cinema-niii7.local`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cinema NIII7 Brasov//RO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${eventUid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `SUMMARY:${escapeICSText(`🎬 Cinema NIII7: ${title}`)}`,
    `DESCRIPTION:${escapeICSText(desc)}`,
    `LOCATION:${escapeICSText(location)}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Filmul începe în curând",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  return lines.map(foldICSLine).join("\r\n") + "\r\n";
}

function hashText(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return h;
}

export function safeFileName(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "bilet";
}

export function createGoogleCalendarUrl(title, desc, location, startDate, endDate) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `🎬 Cinema NIII7: ${title}`,
    dates: `${formatICSDate(startDate)}/${formatICSDate(endDate)}`,
    details: desc,
    location
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadICSFile(title, desc, location, startDate, endDate, options) {
  const icsContent = buildICSContent(title, desc, location, startDate, endDate, options);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Vizionare_${safeFileName(title)}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
