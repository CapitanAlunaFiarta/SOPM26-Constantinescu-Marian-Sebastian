const SIGNATURE_SALT = "CINEMA-NIII7-BRASOV-2026";

export const SEAT_ROWS = 7;
export const SEAT_COLS = 12;
export const MAX_SEATS_PER_ORDER = 8;
export const PROTECTED_SEATS = ["R4L6", "R4L7"];

export function hashString(input, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function createSeededRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seatSortKey(seatId) {
  const match = /^R(\d+)L(\d+)$/.exec(seatId);
  return match ? Number(match[1]) * 100 + Number(match[2]) : Number.MAX_SAFE_INTEGER;
}

export function generateOccupiedSeats(slotKey) {
  const random = createSeededRandom(hashString(slotKey));
  const candidates = [];
  for (let r = 1; r <= SEAT_ROWS; r++) {
    for (let c = 1; c <= SEAT_COLS; c++) {
      const id = `R${r}L${c}`;
      if (!PROTECTED_SEATS.includes(id)) candidates.push(id);
    }
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const count = 10 + Math.floor(random() * 9);
  return candidates.slice(0, count).sort((a, b) => seatSortKey(a) - seatSortKey(b));
}

export function mergeSeatLists(...lists) {
  return Array.from(new Set(lists.flat())).sort((a, b) => seatSortKey(a) - seatSortKey(b));
}

export function createTicketId(now = Date.now(), randomSource = Math.random) {
  let suffix = "";
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(5);
    crypto.getRandomValues(bytes);
    for (const b of bytes) suffix += alphabet[b % alphabet.length];
  } else {
    for (let i = 0; i < 5; i++) suffix += alphabet[Math.floor(randomSource() * alphabet.length)];
  }
  return `NIII7-${now.toString(36).toUpperCase()}-${suffix}`;
}

function signaturePayload({ id, film, data, ora, locuri, format }) {
  return [id, film, data, ora, locuri, format].map((v) => String(v ?? "")).join("|");
}

export function signTicketFields(fields) {
  return hashString(`${SIGNATURE_SALT}|${signaturePayload(fields)}`).toString(36);
}

export function verifyTicketParams(searchParams) {
  const fields = {
    id: searchParams.get("id") || "",
    film: searchParams.get("film") || "",
    data: searchParams.get("data") || "",
    ora: searchParams.get("ora") || "",
    locuri: searchParams.get("locuri") || "",
    format: searchParams.get("format") || ""
  };
  const sig = searchParams.get("sig") || "";

  if (!fields.id || !fields.film || !fields.data || !fields.ora || !fields.locuri) {
    return { valid: false, reason: "missing", fields };
  }
  if (!sig) {
    return { valid: false, reason: "unsigned", fields };
  }
  if (signTicketFields(fields) !== sig) {
    return { valid: false, reason: "tampered", fields };
  }
  return { valid: true, reason: "ok", fields };
}
