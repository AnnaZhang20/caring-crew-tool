import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Home,
  CalendarDays,
  Lightbulb,
  Award,
  ListChecks,
  Dumbbell,
  Apple,
  Brain,
  MoonStar,
  Check,
  Flame,
  Medal,
  Lock,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ACL Guard — Stay Healthy. Play Confident." },
      {
        name: "description",
        content:
          "Your personalized guide to ACL injury prevention and peak athletic performance.",
      },
      { property: "og:title", content: "ACL Guard — Stay Healthy. Play Confident." },
      {
        property: "og:description",
        content:
          "Your personalized guide to ACL injury prevention and peak athletic performance.",
      },
    ],
  }),
  component: App,
});

/* ---------------- data ---------------- */

type PlanItem = {
  id: string;
  tag: string;
  title: string;
  detail: string;
  time: string;
  icon: typeof Dumbbell;
  card: string;
  chip: string;
};

const DAILY_PLAN: PlanItem[] = [
  {
    id: "exercise",
    tag: "Prevention Workout",
    title: "Knee-Smart Warmup",
    detail:
      "Single-leg bridges, lateral band walks and controlled landing practice — 3 sets each, knee tracking over toes.",
    time: "12 min",
    icon: Dumbbell,
    card: "border-sky bg-sky/40",
    chip: "bg-sky text-secondary-foreground",
  },
  {
    id: "fuel",
    tag: "Fuel Goal",
    title: "Post-Practice Plate",
    detail:
      "Grilled chicken, brown rice and a banana — protein plus fast carbs to rebuild muscle after court time.",
    time: "After practice",
    icon: Apple,
    card: "border-mint bg-mint/40",
    chip: "bg-mint text-secondary-foreground",
  },
  {
    id: "mindset",
    tag: "Mental Wellness",
    title: "Breath Before Serve",
    detail:
      "A 60-second box-breathing reset: in for 4, hold for 4, out for 4, hold for 4. Calm nerves, sharper focus.",
    time: "60 sec",
    icon: Brain,
    card: "border-lavender bg-lavender/40",
    chip: "bg-lavender text-secondary-foreground",
  },
  {
    id: "recovery",
    tag: "Recovery",
    title: "Sleep + Stretch",
    detail:
      "8 hours tonight and a 10-minute hamstring and quad foam-roll flow after dinner.",
    time: "Tonight",
    icon: MoonStar,
    card: "border-peach bg-peach/40",
    chip: "bg-peach text-secondary-foreground",
  },
];

const LEARN_TOPICS = [
  {
    title: "Why ACL injuries happen",
    body: "Most ACL tears are non-contact — they happen during cutting, landing or sudden stops when the knee caves inward. Training your hips, glutes and hamstrings keeps the knee stable in those moments.",
    color: "bg-rose/50 border-rose",
  },
  {
    title: "Land like a pro",
    body: "Land softly on the balls of your feet with knees bent and aligned over your toes — never locked or caving in. Practice slow, controlled landings before adding speed or height.",
    color: "bg-sky/50 border-sky",
  },
  {
    title: "Strength that protects",
    body: "Strong hamstrings balance the pull on your knee. Nordic curls, single-leg bridges and lateral band walks 2–3 times a week are proven to cut ACL risk significantly.",
    color: "bg-mint/50 border-mint",
  },
  {
    title: "Fuel for strong joints",
    body: "Protein at every meal rebuilds muscle, vitamin C supports collagen in ligaments, and staying hydrated keeps tissue resilient. Never train hard on an empty tank.",
    color: "bg-sun/60 border-sun",
  },
  {
    title: "Rest is training",
    body: "Fatigue is one of the biggest injury risk factors. Sleep 8+ hours, take at least one full rest day a week, and speak up when something feels off — playing through pain is never worth it.",
    color: "bg-lavender/50 border-lavender",
  },
  {
    title: "Your mind matters",
    body: "Fear of injury can change how you move. Visualization, breathing routines and talking with coaches or teammates build the confidence to play free and safe.",
    color: "bg-peach/50 border-peach",
  },
];

const BADGES = [
  { id: "first", name: "First Rep", need: 1, icon: Medal, desc: "Complete your first plan item" },
  { id: "day3", name: "3-Day Run", need: 3, icon: Flame, desc: "Hold a 3-day streak" },
  { id: "day7", name: "Week Warrior", need: 7, icon: Flame, desc: "Hold a 7-day streak" },
  { id: "day14", name: "Fortnight Focus", need: 14, icon: Flame, desc: "Hold a 14-day streak" },
  { id: "day30", name: "MVP Month", need: 30, icon: Award, desc: "Hold a 30-day streak" },
  { id: "log5", name: "Logged In", need: 5, icon: CalendarDays, desc: "Log 5 calendar events" },
];

type EventType = "workout" | "practice" | "game";
const EVENT_STYLES: Record<EventType, { label: string; dot: string }> = {
  workout: { label: "Workout", dot: "bg-primary" },
  practice: { label: "Practice", dot: "bg-rose" },
  game: { label: "Game", dot: "bg-sun" },
};

/* ---------------- storage helpers ---------------- */

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const todayKey = () => new Date().toISOString().slice(0, 10);

/* ---------------- app ---------------- */

type Tab = "home" | "tasks" | "calendar" | "learn" | "rewards";

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [done, setDone] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : load(`acl-done-${todayKey()}`, []),
  );
  const [events, setEvents] = useState<Record<string, EventType[]>>(() =>
    typeof window === "undefined" ? {} : load("acl-events", {}),
  );
  const [streak, setStreak] = useState<number>(() =>
    typeof window === "undefined" ? 0 : load("acl-streak", 0),
  );

  useEffect(() => save(`acl-done-${todayKey()}`, done), [done]);
  useEffect(() => save("acl-events", events), [events]);
  useEffect(() => save("acl-streak", streak), [streak]);

  const toggleDone = (id: string) => {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id];
      if (!prev.includes(id) && next.length === DAILY_PLAN.length) {
        setStreak((s) => s + 1);
      }
      return next;
    });
  };

  const logEvent = (date: string, type: EventType) => {
    setEvents((prev) => {
      const day = prev[date] ?? [];
      const next = day.includes(type) ? day.filter((t) => t !== type) : [...day, type];
      return { ...prev, [date]: next };
    });
  };

  const totalLogged = useMemo(
    () => Object.values(events).reduce((n, d) => n + d.length, 0),
    [events],
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-24">
      {/* header */}
      <header className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <div className="grid size-10 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
            A
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg font-bold">ACL Guard</p>
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Injury prevention
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-rose/60 px-3 py-1.5 text-sm font-bold text-foreground">
            <Flame className="size-4" /> {streak}
          </div>
          <div className="grid size-10 place-items-center rounded-full bg-lavender text-sm font-bold">
            AZ
          </div>
        </div>
      </header>

      <main className="flex-1 px-5">
        {tab === "home" && (
          <HomeTab done={done} onToggle={toggleDone} streak={streak} go={setTab} />
        )}
        {tab === "tasks" && <TasksTab done={done} onToggle={toggleDone} streak={streak} />}
        {tab === "calendar" && <CalendarTab events={events} onLog={logEvent} />}
        {tab === "learn" && <LearnTab />}
        {tab === "rewards" && <RewardsTab streak={streak} totalLogged={totalLogged} done={done} />}
      </main>

      {/* bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md px-5 pb-4">
        <div className="flex items-center justify-between rounded-2xl border bg-card px-4 py-2 shadow-lg">
          <NavButton icon={Home} label="Home" active={tab === "home"} onClick={() => setTab("home")} />
          <NavButton
            icon={CalendarDays}
            label="Calendar"
            active={tab === "calendar"}
            onClick={() => setTab("calendar")}
          />
          <NavButton
            icon={ListChecks}
            label="Tasks"
            active={tab === "tasks"}
            onClick={() => setTab("tasks")}
          />
          <NavButton
            icon={Lightbulb}
            label="Learn"
            active={tab === "learn"}
            onClick={() => setTab("learn")}
          />
          <NavButton
            icon={Award}
            label="Rewards"
            active={tab === "rewards"}
            onClick={() => setTab("rewards")}
          />
        </div>
      </nav>
    </div>
  );
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <Icon className="size-5" />
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

/* ---------------- home ---------------- */

function HomeTab({
  done,
  onToggle,
  streak,
  go,
}: {
  done: string[];
  onToggle: (id: string) => void;
  streak: number;
  go: (t: Tab) => void;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const allDone = done.length === DAILY_PLAN.length;

  return (
    <div className="animate-rise">
      <p className="mt-5 text-xs font-bold tracking-widest text-muted-foreground uppercase">
        {today}
      </p>
      <h1 className="mt-2 font-display text-4xl leading-[1.05] font-bold text-primary italic">
        Stay Healthy.
        <br />
        Play Confident.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Your personalized guide to ACL injury prevention and peak athletic performance.
      </p>

      {/* streak card */}
      <div className="mt-5 flex items-center gap-4 rounded-2xl border-2 border-rose bg-rose/30 p-4">
        <div
          className="grid size-16 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(var(--primary) ${(done.length / DAILY_PLAN.length) * 360}deg, var(--muted) 0deg)`,
          }}
        >
          <div className="grid size-12 place-items-center rounded-full bg-card">
            <span className="animate-pop-in font-display text-xl font-bold" key={done.length}>
              {done.length}/4
            </span>
          </div>
        </div>
        <div>
          <p className="font-display text-lg font-bold">
            {allDone ? "Plan complete!" : "Today's plan"}
          </p>
          <p className="text-xs text-muted-foreground">
            {allDone
              ? `Streak extended to ${streak} days. Amazing work!`
              : "Finish all four to grow your streak."}
          </p>
        </div>
      </div>

      {/* plan cards */}
      <div className="mt-5 space-y-3">
        {DAILY_PLAN.map((item, i) => {
          const isDone = done.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`animate-rise w-full rounded-2xl border-2 p-4 text-left transition-transform hover:-translate-y-0.5 active:scale-[0.98] ${item.card} ${
                isDone ? "opacity-70" : ""
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${item.chip}`}>
                  {item.tag}
                </span>
                <span className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                  {item.time}
                  <span
                    className={`grid size-6 place-items-center rounded-full border-2 transition-colors ${
                      isDone ? "border-primary bg-primary text-primary-foreground" : "border-foreground/30"
                    }`}
                  >
                    {isDone && <Check className="size-4" />}
                  </span>
                </span>
              </div>
              <div className="mt-3 flex items-start gap-3">
                <item.icon className="mt-0.5 size-6 shrink-0" />
                <div>
                  <p className={`font-display text-xl font-bold ${isDone ? "line-through" : ""}`}>
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/70">{item.detail}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => go("learn")}
        className="mt-5 w-full rounded-2xl border-2 border-lavender bg-lavender/30 p-4 text-left transition-transform hover:-translate-y-0.5"
      >
        <p className="text-[10px] font-bold tracking-wide uppercase">Did you know?</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
          Most ACL tears happen without any contact — landing and cutting mechanics matter more
          than anything. Tap to learn how to move safer.
        </p>
      </button>
    </div>
  );
}

/* ---------------- tasks ---------------- */

function TasksTab({
  done,
  onToggle,
  streak,
}: {
  done: string[];
  onToggle: (id: string) => void;
  streak: number;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const allDone = done.length === DAILY_PLAN.length;
  const pct = (done.length / DAILY_PLAN.length) * 100;

  return (
    <div className="animate-rise">
      <p className="mt-5 text-xs font-bold tracking-widest text-muted-foreground uppercase">
        {today}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-primary italic">Today's Tasks</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {allDone
          ? "All done — streak is safe for today!"
          : "Check off each task to keep your streak growing."}
      </p>

      {/* progress card */}
      <div className="mt-4 rounded-2xl border-2 border-mint bg-mint/30 p-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-bold">
            {done.length}/{DAILY_PLAN.length} completed
          </p>
          <span className="flex items-center gap-1 rounded-full bg-rose/60 px-3 py-1 text-sm font-bold">
            <Flame className="size-4" /> {streak} day{streak === 1 ? "" : "s"}
          </span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-card">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* checklist */}
      <div className="mt-4 space-y-3">
        {DAILY_PLAN.map((item, i) => {
          const isDone = done.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`animate-rise flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-transform hover:-translate-y-0.5 active:scale-[0.98] ${item.card}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                  isDone ? "border-primary bg-primary text-primary-foreground" : "border-foreground/30 bg-card/60"
                }`}
              >
                {isDone && <Check className="size-4" />}
              </span>
              <item.icon className="size-5 shrink-0" />
              <span className="flex-1">
                <span
                  className={`block font-display text-lg font-bold ${isDone ? "line-through opacity-70" : ""}`}
                >
                  {item.title}
                </span>
                <span className="block text-[11px] font-semibold tracking-wide uppercase opacity-70">
                  {item.tag} · {item.time}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {allDone && (
        <div className="animate-pop-in mt-4 rounded-2xl border-2 border-sun bg-sun/50 p-4 text-center">
          <p className="font-display text-xl font-bold">🎉 Plan complete!</p>
          <p className="mt-1 text-sm text-foreground/80">
            Every task checked off — see you tomorrow for the next set.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------------- calendar ---------------- */

function CalendarTab({
  events,
  onLog,
}: {
  events: Record<string, EventType[]>;
  onLog: (date: string, type: EventType) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string>(todayKey());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const cells: (string | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }

  const shift = (n: number) => setCursor(new Date(year, month + n, 1));
  const selectedEvents = events[selected] ?? [];

  return (
    <div className="animate-rise">
      <h1 className="mt-5 font-display text-3xl font-bold text-primary italic">Smart Calendar</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Log workouts, practices and games — your plan adapts to your schedule.
      </p>

      <div className="mt-4 rounded-2xl border-2 border-sky bg-sky/30 p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => shift(-1)} aria-label="Previous month" className="rounded-full p-1.5 hover:bg-card">
            <ChevronLeft className="size-5" />
          </button>
          <p className="font-display text-lg font-bold">{monthName}</p>
          <button onClick={() => shift(1)} aria-label="Next month" className="rounded-full p-1.5 hover:bg-card">
            <ChevronRight className="size-5" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((key, i) =>
            key === null ? (
              <span key={`e${i}`} />
            ) : (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-sm font-semibold transition-colors ${
                  key === selected
                    ? "bg-primary text-primary-foreground"
                    : key === todayKey()
                      ? "bg-card ring-2 ring-primary/40"
                      : "hover:bg-card"
                }`}
              >
                {Number(key.slice(-2))}
                <span className="flex gap-0.5">
                  {(events[key] ?? []).map((t) => (
                    <span key={t} className={`size-1.5 rounded-full ${EVENT_STYLES[t].dot}`} />
                  ))}
                </span>
              </button>
            ),
          )}
        </div>
      </div>

      {/* log panel */}
      <div className="mt-4 rounded-2xl border-2 border-mint bg-mint/30 p-4">
        <p className="font-display text-lg font-bold">
          Log for{" "}
          {new Date(selected + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(Object.keys(EVENT_STYLES) as EventType[]).map((t) => {
            const active = selectedEvents.includes(t);
            return (
              <button
                key={t}
                onClick={() => onLog(selected, t)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-2.5 text-xs font-bold transition-all active:scale-95 ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-foreground/15 bg-card hover:border-primary/50"
                }`}
              >
                <span className={`size-2 rounded-full ${EVENT_STYLES[t].dot}`} />
                {EVENT_STYLES[t].label}
              </button>
            );
          })}
        </div>
        {selectedEvents.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedEvents.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] font-bold"
              >
                {EVENT_STYLES[t].label}
                <button onClick={() => onLog(selected, t)} aria-label={`Remove ${t}`}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border-2 border-peach bg-peach/30 p-4">
        <p className="text-[10px] font-bold tracking-wide uppercase">Coach's tip</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
          Logged a game tomorrow? Today's plan automatically emphasizes landing mechanics and
          early recovery. Small shifts, big protection.
        </p>
      </div>
    </div>
  );
}

/* ---------------- learn ---------------- */

function LearnTab() {
  return (
    <div className="animate-rise">
      <h1 className="mt-5 font-display text-3xl font-bold text-primary italic">Learn & Move Safe</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Science-based ACL prevention, made simple — strength, movement, fuel, mindset and rest.
      </p>
      <div className="mt-4 space-y-3">
        {LEARN_TOPICS.map((t, i) => (
          <div
            key={t.title}
            className={`animate-rise rounded-2xl border-2 p-4 ${t.color}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <p className="font-display text-lg font-bold">{t.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/80">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- rewards ---------------- */

function RewardsTab({
  streak,
  totalLogged,
  done,
}: {
  streak: number;
  totalLogged: number;
  done: string[];
}) {
  const progressFor = (id: string) => {
    if (id === "first") return done.length > 0 ? 1 : 0;
    if (id === "log5") return totalLogged;
    return streak;
  };

  const unlocked = BADGES.filter((b) => progressFor(b.id) >= b.need).length;

  return (
    <div className="animate-rise">
      <h1 className="mt-5 font-display text-3xl font-bold text-primary italic">Rewards</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Streaks, badges and milestones — consistency is your superpower.
      </p>

      <div className="mt-4 flex items-center gap-4 rounded-2xl border-2 border-rose bg-rose/30 p-5">
        <div className="grid size-20 shrink-0 place-items-center rounded-full bg-card shadow-sm">
          <div className="text-center">
            <p className="font-display text-3xl leading-none font-bold">{streak}</p>
            <p className="text-[9px] font-bold tracking-wide text-muted-foreground uppercase">days</p>
          </div>
        </div>
        <div>
          <p className="font-display text-xl font-bold">Current streak</p>
          <p className="text-sm text-muted-foreground">
            Complete all 4 plan items daily to keep it burning.
          </p>
        </div>
      </div>

      <p className="mt-5 mb-3 text-xs font-bold tracking-widest text-muted-foreground uppercase">
        Badge shelf · {unlocked} of {BADGES.length} unlocked
      </p>
      <div className="grid grid-cols-2 gap-3">
        {BADGES.map((b, i) => {
          const progress = progressFor(b.id);
          const isUnlocked = progress >= b.need;
          return (
            <div
              key={b.id}
              className={`animate-rise rounded-2xl border-2 p-4 text-center ${
                isUnlocked ? "border-sun bg-sun/40" : "border-dashed border-foreground/20 bg-card"
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={`mx-auto grid size-12 place-items-center rounded-full ${
                  isUnlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {isUnlocked ? <b.icon className="size-6" /> : <Lock className="size-5" />}
              </div>
              <p className="mt-2 font-display text-base font-bold">{b.name}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{b.desc}</p>
              {!isUnlocked && (
                <p className="mt-1 text-[11px] font-bold text-primary">
                  {Math.min(progress, b.need)}/{b.need}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
