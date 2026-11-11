// AI-assisted (Claude Code): tests for reminderDates.
/// <reference types="jest" />
import { reminderDates } from "./reminderDates";

const local = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min);

describe("reminderDates", () => {
  it("returns 30, 7 and 1 day before at 9:00 when all are in the future", () => {
    const result = reminderDates("2027-01-15", local(2026, 11, 11, 12));
    expect(result).toEqual([
      { daysBefore: 30, at: local(2026, 12, 16, 9) },
      { daysBefore: 7, at: local(2027, 1, 8, 9) },
      { daysBefore: 1, at: local(2027, 1, 14, 9) },
    ]);
  });

  it("leaves out reminders already passed", () => {
    const result = reminderDates("2026-11-20", local(2026, 11, 11, 12));
    expect(result.map((r) => r.daysBefore)).toEqual([7, 1]);
  });

  it("leaves out a reminder due at this exact moment", () => {
    const result = reminderDates("2026-11-12", local(2026, 11, 11, 9));
    expect(result).toEqual([]);
  });

  it("keeps today's reminder before 9:00", () => {
    const result = reminderDates("2026-11-12", local(2026, 11, 11, 8, 59));
    expect(result).toEqual([{ daysBefore: 1, at: local(2026, 11, 11, 9) }]);
  });

  it("crosses month and leap-year boundaries", () => {
    const result = reminderDates("2028-03-01", local(2028, 1, 1));
    expect(result.map((r) => r.at)).toEqual([local(2028, 1, 31, 9), local(2028, 2, 23, 9), local(2028, 2, 29, 9)]);
  });

  it("returns nothing for a deadline already passed", () => {
    expect(reminderDates("2026-10-01", local(2026, 11, 11))).toEqual([]);
  });
});
