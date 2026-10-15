import { Award, CalendarDays, Flame, Lightbulb, Medal } from "lucide-react";

export type RewardProgress = {
  days: Record<string, number>;
  learned: string[];
  earned: string[];
};

export const EMPTY_PROGRESS: RewardProgress = { days: {}, learned: [], earned: [] };
export const BADGES = [
  { id: "first", name: "First Rep", need: 1, kind: "tasks", icon: Medal, desc: "Complete your first task" },
  { id: "day3", name: "3-Day Run", need: 3, kind: "streak", icon: Flame, desc: "3 consecutive days with 3 of 4 tasks" },
  { id: "day7", name: "Week Warrior", need: 7, kind: "streak", icon: Flame, desc: "7 consecutive days with 3 of 4 tasks" },
  { id: "day14", name: "Fortnight Focus", need: 14, kind: "streak", icon: Flame, desc: "14 consecutive days with 3 of 4 tasks" },
  { id: "day30", name: "MVP Month", need: 30, kind: "streak", icon: Award, desc: "30 consecutive days with 3 of 4 tasks" },
  { id: "learn1", name: "Curious Mind", need: 1, kind: "learn", icon: Lightbulb, desc: "Learn your first fact" },
  { id: "learn5", name: "Knowledge Builder", need: 5, kind: "learn", icon: Lightbulb, desc: "Learn 5 different facts" },
  { id: "learn10", name: "ACL Scholar", need: 10, kind: "learn", icon: Award, desc: "Learn all 10 facts" },
  { id: "log5", name: "Logged In", need: 5, kind: "events", icon: CalendarDays, desc: "Log 5 calendar events" },
] as const;

export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function previousDay(key: string): string {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

export function currentStreak(days: Record<string, number>, today: string): number {
  let cursor = (days[today] ?? 0) >= 3 ? today : previousDay(today);
  let count = 0;
  while ((days[cursor] ?? 0) >= 3) {
    count++;
    cursor = previousDay(cursor);
  }
  return count;
}

export function badgeProgress(kind: string, progress: RewardProgress, today: string, events: number): number {
  if (kind === "learn") return new Set(progress.learned).size;
  if (kind === "events") return events;
  if (kind === "tasks") return Math.max(0, ...Object.values(progress.days));
  return currentStreak(progress.days, today);
}

export function awardBadges(progress: RewardProgress, today: string, events: number): RewardProgress {
  const earned = new Set(progress.earned);
  for (const badge of BADGES) {
    if (badgeProgress(badge.kind, progress, today, events) >= badge.need) earned.add(badge.id);
  }
  return { ...progress, earned: [...earned] };
}