const MAX_TIMEOUT_MS = 2147483647;
const HOUR_MS = 60 * 60 * 1000;
const activeTimers = new Map();

export function computeReminderDelay(startDate, now = Date.now()) {
  return startDate.getTime() - HOUR_MS - now;
}

export function scheduleShowReminder(key, startDate, buildNotification, now = Date.now()) {
  if (activeTimers.has(key)) return { status: "already" };

  const delay = computeReminderDelay(startDate, now);
  if (startDate.getTime() <= now) return { status: "past" };

  if (delay <= 0) {
    buildNotification();
    return { status: "sent-now" };
  }
  if (delay > MAX_TIMEOUT_MS) return { status: "too-far" };

  const timer = setTimeout(() => {
    activeTimers.delete(key);
    buildNotification();
  }, delay);
  activeTimers.set(key, timer);
  return { status: "scheduled", delay };
}

export function cancelAllReminders() {
  for (const timer of activeTimers.values()) clearTimeout(timer);
  activeTimers.clear();
}
