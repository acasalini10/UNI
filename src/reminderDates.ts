// AI-assisted (Claude Code): the moments of the deadline reminders (30, 7 and 1 day before, at 9:00 on the phone's clock), past ones left out.
// Kept outside src/lib by decision 2026-11-11: written by Claude Code, not part of the CS50 core.

export const REMINDER_DAYS = [30, 7, 1] as const;
export const REMINDER_HOUR = 9;

export interface Reminder {
  daysBefore: (typeof REMINDER_DAYS)[number];
  at: Date;
}

// deadline is YYYY-MM-DD. The Date constructor in local time handles month and year boundaries and daylight saving.
export function reminderDates(deadline: string, now = new Date()): Reminder[] {
  const [y, m, d] = deadline.split("-").map(Number);
  return REMINDER_DAYS.map((daysBefore) => ({
    daysBefore,
    at: new Date(y, m - 1, d - daysBefore, REMINDER_HOUR, 0, 0, 0),
  })).filter((reminder) => reminder.at.getTime() > now.getTime());
}
