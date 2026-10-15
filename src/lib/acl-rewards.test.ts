/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { awardBadges, currentStreak, EMPTY_PROGRESS, localDateKey } from "./acl-rewards";

describe("task and learning rewards", () => {
  test("three tasks qualify, two do not, and four do not count twice", () => {
    expect(currentStreak({ "2026-10-14": 3, "2026-10-15": 4 }, "2026-10-15")).toBe(2);
    expect(currentStreak({ "2026-10-15": 2 }, "2026-10-15")).toBe(0);
  });
  test("yesterday's streak stays available today but expires after a missed day", () => {
    const days = { "2026-10-13": 3, "2026-10-14": 3 };
    expect(currentStreak(days, "2026-10-15")).toBe(2);
    expect(currentStreak(days, "2026-10-16")).toBe(0);
  });
  test("consecutive dates cross month and year boundaries", () => {
    expect(currentStreak({ "2025-12-31": 3, "2026-01-01": 3 }, "2026-01-01")).toBe(2);
    expect(localDateKey(new Date(2026, 9, 15, 23))).toBe("2026-10-15");
  });
  test("earned badges survive a broken streak; facts count once", () => {
    const progress = awardBadges({ ...EMPTY_PROGRESS, days: { "2026-10-13": 3, "2026-10-14": 3, "2026-10-15": 3 }, learned: ["protein", "protein"] }, "2026-10-15", 0);
    expect(progress.earned).toContain("day3");
    expect(progress.earned).toContain("learn1");
    expect(progress.earned).not.toContain("learn5");
    expect(awardBadges(progress, "2026-10-20", 0).earned).toContain("day3");
  });
});