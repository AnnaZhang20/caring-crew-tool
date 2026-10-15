import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { LEARN_CATEGORIES, LEARN_TOPICS, type LearnCategory, learningAttribution } from "@/lib/acl-learning";
import { BADGES, EMPTY_PROGRESS, awardBadges, badgeProgress, currentStreak, localDateKey, type RewardProgress } from "@/lib/acl-rewards";
import { Bell, BellOff, ShieldCheck, Trash2, UserRound, Settings2, Eye, EyeOff } from "lucide-react";
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
  ChevronDown,
  ExternalLink,
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  steps: string[];
  note?: string;
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
      "Build strength and landing control with bridges, band walks and coach-guided practice. Stop if a drill hurts.",
    steps: [
      "Single-leg bridges — 3 sets of 10",
      "Lateral band walks — 3 sets each side",
      "8 slow landings — bend hips and knees, knees follow toes",
    ],
    note: "Keep your trunk steady and ask your coach for feedback. Prevention works best as a consistent, varied program—not one exercise. Stop painful drills and tell a trusted adult.",
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
      "Pair protein with carbs after practice, and add a vitamin C food. Regular meals and snacks support training, growth and recovery.",
    steps: [
      "Lean protein — chicken, eggs or beans",
      "Brown rice or whole-grain carbs",
      "Banana or fruit to refill energy",
      "Add vitamin C — orange, kiwi, strawberries or peppers",
    ],
    note: "Collagen is optional—not proven to prevent ACL tears in teens. Before trying collagen or vitamin D supplements, ask a parent or guardian and a sports dietitian or clinician. Food comes first; no supplement is needed to complete this task.",
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
    steps: [
      "Sit tall and close your eyes",
      "In for 4 · hold 4 · out 4 · hold 4",
      "Repeat the cycle for 60 seconds",
      "Name one worry; share it with a trusted adult if needed",
    ],
    note: "Fear after an injury is normal. Breathing can help you cope, but it does not replace support from your care team or return-to-sport clearance.",
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
    steps: [
      "Foam-roll hamstrings and quads — 10 min",
      "Screens off 30 min before bed",
      "Lights out for a full 8 hours",
    ],
    time: "Tonight",
    icon: MoonStar,
    card: "border-peach bg-peach/40",
    chip: "bg-peach text-secondary-foreground",
  },
];

type EventType = "workout" | "practice" | "game";
const EVENT_STYLES: Record<EventType, { label: string; dot: string; chip: string; short: string }> = {
  workout: { label: "Workout", dot: "bg-primary", chip: "bg-primary text-primary-foreground", short: "Wrk" },
  practice: { label: "Practice", dot: "bg-rose", chip: "bg-rose text-foreground", short: "Prac" },
  game: { label: "Game", dot: "bg-sun", chip: "bg-sun text-foreground", short: "Game" },
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

const todayKey = localDateKey;

/* ---------------- app ---------------- */

type Tab = "home" | "tasks" | "calendar" | "learn" | "rewards" | "profile";

type Profile = {
  name: string;
  sport: string;
  team: string;
  reminders: boolean;
  weeklyReport: boolean;
  privateProfile: boolean;
};

const DEFAULT_PROFILE: Profile = {
  name: "Anna Zhang",
  sport: "Volleyball",
  team: "Basketball",
  reminders: true,
  weeklyReport: true,
  privateProfile: true,
};

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [day, setDay] = useState("");
  const [done, setDone] = useState<string[]>([]);
  const [events, setEvents] = useState<Record<string, EventType[]>>({});
  const [progress, setProgress] = useState<RewardProgress>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const date = todayKey();
    const savedDone = load<string[]>(`acl-done-${date}`, []).filter((id) => DAILY_PLAN.some((item) => item.id === id));
    const savedProgress = load<RewardProgress>("acl-rewards", EMPTY_PROGRESS);
    // Migrate existing dated task records, never the old increment-only streak counter.
    const days = { ...savedProgress.days };
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("acl-done-")) {
        days[key.slice(9)] = load<string[]>(key, []).filter((id) => DAILY_PLAN.some((item) => item.id === id)).length;
      }
    }
    days[date] = savedDone.length;
    setDay(date);
    setDone(savedDone);
    setEvents(load("acl-events", {}));
    setProgress({ ...savedProgress, days });
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const checkDay = () => {
      const date = todayKey();
      if (date !== day) {
        setDay(date);
        setDone(load(`acl-done-${date}`, []));
      }
    };
    const timer = window.setInterval(checkDay, 30000);
    window.addEventListener("focus", checkDay);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", checkDay); };
  }, [ready, day]);

  useEffect(() => { if (ready) save(`acl-done-${day}`, done); }, [done, ready, day]);
  useEffect(() => { if (ready) save("acl-events", events); }, [events, ready]);
  useEffect(() => { if (ready) save("acl-rewards", progress); }, [progress, ready]);

  const streak = currentStreak(progress.days, day || todayKey());
  const toggleDone = (id: string) => {
    if (!ready) return;
    const next = done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
    const item = DAILY_PLAN.find((task) => task.id === id);
    if (item) {
      const savedSteps = load<Record<string, number[]>>(`acl-steps-${day}`, {});
      save(`acl-steps-${day}`, { ...savedSteps, [id]: next.includes(id) ? item.steps.map((_, i) => i) : [] });
    }
    setDone(next);
    setProgress((prev) => awardBadges({ ...prev, days: { ...prev.days, [day]: next.length } }, day, totalLogged));
  };
  const learnFact = (id: string) => {
    setProgress((prev) => awardBadges({ ...prev, learned: [...new Set([...prev.learned, id])] }, day, totalLogged));
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

  useEffect(() => {
    if (!ready) return;
    setProgress((prev) => {
      const next = awardBadges(prev, day, totalLogged);
      return next.earned.length === prev.earned.length ? prev : next;
    });
  }, [totalLogged, ready, day]);

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
          <button
            onClick={() => setTab("profile")}
            aria-label="Open profile and settings"
            className={`grid size-10 place-items-center rounded-full bg-lavender text-sm font-bold transition-transform hover:scale-105 active:scale-95 ${
              tab === "profile" ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
            }`}
          >
            AZ
          </button>
        </div>
      </header>

      <main className="flex-1 px-5">
        {tab === "home" && (
          <HomeTab date={day} done={done} onToggle={toggleDone} streak={streak} go={setTab} />
        )}
        {tab === "tasks" && <TasksTab key={day} date={day} done={done} onToggle={toggleDone} streak={streak} />}
        {tab === "calendar" && <CalendarTab events={events} onLog={logEvent} />}
        {tab === "learn" && <LearnTab learned={progress.learned} onLearn={learnFact} />}
        {tab === "rewards" && <RewardsTab streak={streak} totalLogged={totalLogged} progress={progress} day={day} />}
        {tab === "profile" && (
          <ProfileTab
            streak={streak}
            totalLogged={totalLogged}
            onClearData={() => {
              setDone([]);
              setEvents({});
              for (const key of Object.keys(localStorage)) {
                if (key.startsWith("acl-done-") || key.startsWith("acl-steps-") || key === "acl-streak") localStorage.removeItem(key);
              }
              setProgress(EMPTY_PROGRESS);
            }}
          />
        )}
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
  date,
  done,
  onToggle,
  streak,
  go,
}: {
  date: string;
  done: string[];
  onToggle: (id: string) => void;
  streak: number;
  go: (t: Tab) => void;
}) {
  const today = date ? new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }) : "";
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
            {done.length >= 3
              ? `Today's streak goal met · ${streak} day${streak === 1 ? "" : "s"}!`
              : "Complete 3 of 4 tasks to grow your streak."}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">AI-generated daily routines · Fuel and movement informed by Anna’s research</p>
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
        <p className="text-[10px] font-bold tracking-wide uppercase">Did you know? · AI-written</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
          Landing control is one part of ACL prevention, alongside strength, balance and consistent practice.
        </p>
      </button>
    </div>
  );
}

/* ---------------- tasks ---------------- */

function TasksTab({
  date,
  done,
  onToggle,
  streak,
}: {
  date: string;
  done: string[];
  onToggle: (id: string) => void;
  streak: number;
}) {
  const today = date ? new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }) : "";
  const allDone = done.length === DAILY_PLAN.length;
  const pct = (done.length / DAILY_PLAN.length) * 100;

  // which task is expanded
  const [open, setOpen] = useState<string | null>(null);
  // checked sub-steps per task, persisted per day: { taskId: [stepIdx...] }
  const [steps, setSteps] = useState<Record<string, number[]>>({});
  const [stepsLoaded, setStepsLoaded] = useState(false);
  useEffect(() => {
    setSteps(load(`acl-steps-${date}`, {}));
    setStepsLoaded(true);
  }, [date]);
  useEffect(() => {
    if (stepsLoaded) save(`acl-steps-${date}`, steps);
  }, [steps, stepsLoaded, date]);

  const checkedSteps = (item: PlanItem) => done.includes(item.id)
    ? item.steps.map((_, i) => i)
    : (steps[item.id]?.length === item.steps.length ? [] : steps[item.id] ?? []);

  const toggleTask = (id: string) => {
    const item = DAILY_PLAN.find((p) => p.id === id);
    if (!item) return;
    const isDone = done.includes(id);
    onToggle(id);
    // checking a task checks off all its steps; unchecking resets them
    setSteps((prev) => ({
      ...prev,
      [id]: isDone ? [] : item.steps.map((_, i) => i),
    }));
  };

  const toggleStep = (item: PlanItem, idx: number) => {
    const current = checkedSteps(item);
    const next = current.includes(idx)
      ? current.filter((s) => s !== idx)
      : [...current, idx];
    setSteps((prev) => ({ ...prev, [item.id]: next }));
    // last step checked → the whole task is complete
    if ((next.length === item.steps.length) !== done.includes(item.id)) {
      onToggle(item.id);
    }
  };

  return (
    <div className="animate-rise">
      <p className="mt-5 text-xs font-bold tracking-widest text-muted-foreground uppercase">
        {today}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-primary italic">Today's Tasks</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {done.length >= 3
          ? "Streak goal met — 3 of 4 tasks complete!"
          : "Complete 3 of 4 tasks to keep your streak going."}
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

      <p className="mt-3 text-xs text-muted-foreground">AI-generated daily routines · Fuel and movement informed by Anna’s research</p>
      {/* expandable checklist */}
      <div className="mt-4 space-y-3">
        {DAILY_PLAN.map((item, i) => {
          const isDone = done.includes(item.id);
          const isOpen = open === item.id;
           const stepCount = checkedSteps(item).length;
          const total = item.steps.length;
          return (
            <div
              key={item.id}
              className={`animate-rise overflow-hidden rounded-2xl border-2 transition-all ${item.card}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* header row */}
              <div className="flex items-center gap-3 p-4">
                <button
                  onClick={() => toggleTask(item.id)}
                  aria-label={isDone ? `Mark ${item.title} not done` : `Mark ${item.title} done`}
                   role="checkbox"
                   aria-checked={isDone}
                  className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors active:scale-90 ${
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-foreground/30 bg-card/60"
                  }`}
                >
                  {isDone && <Check className="size-4" />}
                </button>
                <button
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                   aria-controls={`task-steps-${item.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <item.icon className="size-5 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate font-display text-lg font-bold ${isDone ? "line-through opacity-70" : ""}`}
                    >
                      {item.title}
                    </span>
                    <span className="block text-[11px] font-semibold tracking-wide uppercase opacity-70">
                      {item.tag} · {item.time}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full bg-card/70 px-2 py-0.5 text-[10px] font-bold ${
                      stepCount === total ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {stepCount}/{total}
                  </span>
                  <ChevronDown
                    className={`size-5 shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {/* expanded checklist */}
              {isOpen && (
                <div id={`task-steps-${item.id}`} className="animate-rise border-t-2 border-dashed border-foreground/15 px-4 pt-3 pb-4">
                  <ul className="space-y-2">
                    {item.steps.map((step, idx) => {
                      const stepChecked = checkedSteps(item).includes(idx);
                      return (
                        <li key={idx}>
                          <button
                            onClick={() => toggleStep(item, idx)}
                             role="checkbox"
                             aria-checked={stepChecked}
                            aria-label={
                              stepChecked ? `Uncheck step: ${step}` : `Check step: ${step}`
                            }
                            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                              stepChecked
                                ? "border-primary/40 bg-card/70"
                                : "border-transparent bg-card/40"
                            }`}
                          >
                            <span
                              className={`grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors ${
                                stepChecked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-foreground/30 bg-card"
                              }`}
                            >
                              {stepChecked && <Check className="size-3.5" />}
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                stepChecked ? "text-muted-foreground line-through" : ""
                              }`}
                            >
                              {step}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {item.note && (
                    <p className="mt-3 text-xs leading-relaxed text-foreground/80">{item.note}</p>
                  )}
                </div>
              )}
            </div>
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
        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {cells.map((key, i) => {
            if (key === null) return <span key={`e${i}`} />;
            const dayEvents = events[key] ?? [];
            const isToday = key === todayKey();
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                aria-label={`${key}, ${dayEvents.length ? dayEvents.map((t) => EVENT_STYLES[t].label).join(", ") : "no events"}`}
                className={`flex min-h-[56px] flex-col items-center gap-0.5 rounded-lg border-2 px-0.5 pt-0.5 pb-1 transition-colors ${
                  key === selected
                    ? "border-primary bg-primary/10"
                    : isToday
                      ? "border-primary/40 bg-card"
                      : "border-foreground/10 bg-card/60 hover:border-primary/40"
                }`}
              >
                <span className={`text-xs font-bold leading-none ${key === selected ? "text-primary" : isToday ? "text-primary" : "text-foreground/70"}`}>
                  {Number(key.slice(-2))}
                </span>
                <span className="flex w-full flex-col items-center gap-0.5">
                  {dayEvents.map((t) => (
                    <span
                      key={t}
                      className={`w-full rounded-full px-0.5 py-[1px] text-center text-[7px] font-bold leading-none ${EVENT_STYLES[t].chip}`}
                    >
                      {EVENT_STYLES[t].short}
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
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
        <p className="text-[10px] font-bold tracking-wide uppercase">Training note · AI-generated</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
          Keep your coach-led warmup consistent through the season, and make time for food and recovery around games.
        </p>
      </div>
    </div>
  );
}

/* ---------------- learn ---------------- */

function LearnTab({ learned, onLearn }: { learned: string[]; onLearn: (id: string) => void }) {
  const [category, setCategory] = useState<LearnCategory>("All");
  const topics = LEARN_TOPICS.filter((topic) => category === "All" || topic.category === category);
  return (
    <div className="animate-rise">
      <h1 className="mt-5 font-display text-3xl font-bold text-primary italic">Learn & Move Safe</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Stronger habits. Steadier movement. Fuel for your sport.
      </p>
      <p className="mt-3 border-l-2 border-primary pl-3 text-xs leading-relaxed text-muted-foreground">
        Education, not a treatment plan. If you’re injured or recovering from surgery, follow your clinician’s guidance.
      </p>
      <p className="mt-3 text-xs text-muted-foreground">Anna’s research = topics from your notes. Article wording and practical actions are AI-written, not your original text.</p>
      <p className="mt-2 text-sm font-bold text-primary" aria-live="polite">{learned.length}/{LEARN_TOPICS.length} facts learned</p>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Learning topics">
        {LEARN_CATEGORIES.map((value) => (
          <Button key={value} variant={category === value ? "default" : "outline"} size="sm"
            aria-pressed={category === value} onClick={() => setCategory(value)}>
            {value}
          </Button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {topics.map((t, i) => (
          <div
            key={t.id}
            className={`animate-rise rounded-2xl border-2 p-4 ${t.color}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <p className="text-[10px] font-bold uppercase text-muted-foreground">{t.category}</p>
            <p className="mt-1 text-xs font-semibold text-primary">{learningAttribution(t.id)}</p>
            <h2 className="mt-1 font-display text-lg font-bold">{t.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-foreground/80">{t.body}</p>
            <p className="mt-3 text-sm leading-relaxed"><span className="font-bold">Try today: </span>{t.action}</p>
            <details className="mt-3 border-t border-foreground/15 pt-3">
              <summary className="cursor-pointer text-xs font-bold text-primary">Evidence & sources</summary>
              <p className="mt-2 text-xs leading-relaxed text-foreground/80">{t.evidence}</p>
              <div className="mt-2 flex flex-col items-start gap-2">
                {t.sources.map((source) => (
                  <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary underline underline-offset-2">
                    {source.label}<ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ))}
              </div>
            </details>
            <Button className="mt-3" size="sm" variant={learned.includes(t.id) ? "secondary" : "outline"}
              aria-label={`Mark learned: ${t.title}`} disabled={learned.includes(t.id)} onClick={() => onLearn(t.id)}>
              {learned.includes(t.id) ? <Check /> : <Lightbulb />}
              {learned.includes(t.id) ? "Learned" : "I learned this"}
            </Button>
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
  progress,
  day,
}: {
  streak: number;
  totalLogged: number;
  progress: RewardProgress;
  day: string;
}) {
  const unlocked = BADGES.filter((b) => progress.earned.includes(b.id)).length;

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
            Complete at least 3 of 4 tasks each day. Earned badges stay yours, even after a missed day.
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm font-bold text-primary">{progress.learned.length}/{LEARN_TOPICS.length} facts learned</p>
      <p className="mt-1 text-xs text-muted-foreground">AI-generated badge names · Anna’s task-streak and learning reward goals</p>
      <p className="mt-5 mb-3 text-xs font-bold tracking-widest text-muted-foreground uppercase">
        Badge shelf · {unlocked} of {BADGES.length} unlocked
      </p>
      <div className="grid grid-cols-2 gap-3">
        {BADGES.map((b, i) => {
          const count = badgeProgress(b.kind, progress, day || todayKey(), totalLogged);
          const isUnlocked = progress.earned.includes(b.id);
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
              {isUnlocked && <p className="mt-1 text-xs font-bold text-primary">Earned</p>}
              {!isUnlocked && (
                <p className="mt-1 text-[11px] font-bold text-primary">
                  {Math.min(count, b.need)}/{b.need}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- profile & settings ---------------- */

function Toggle({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        on ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 size-6 rounded-full bg-card shadow transition-all ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function ProfileTab({
  streak,
  totalLogged,
  onClearData,
}: {
  streak: number;
  totalLogged: number;
  onClearData: () => void;
}) {
  const [profile, setProfile] = useState<Profile>(() =>
    typeof window === "undefined" ? DEFAULT_PROFILE : load("acl-profile", DEFAULT_PROFILE),
  );
  const [editing, setEditing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => save("acl-profile", profile), [profile]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="animate-rise">
      <h1 className="mt-5 font-display text-3xl font-bold text-primary italic">Profile & Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your account, preferences and privacy — all in one place.
      </p>

      {/* account card */}
      <div className="mt-4 rounded-2xl border-2 border-lavender bg-lavender/30 p-4">
        <div className="flex items-center gap-4">
          <div className="grid size-16 shrink-0 place-items-center rounded-full bg-primary font-display text-xl font-bold text-primary-foreground">
            {initials || "?"}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-2">
                <input
                  value={profile.name}
                  onChange={(e) => set("name", e.target.value)}
                  aria-label="Name"
                  className="w-full rounded-lg border bg-card px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <input
                    value={profile.sport}
                    onChange={(e) => set("sport", e.target.value)}
                    aria-label="Sport"
                    placeholder="Sport"
                    className="w-1/2 rounded-lg border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    value={profile.team}
                    onChange={(e) => set("team", e.target.value)}
                    aria-label="Team"
                    placeholder="Team"
                    className="w-1/2 rounded-lg border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="font-display text-xl font-bold">{profile.name}</p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {profile.sport} · {profile.team}
                </p>
              </>
            )}
          </div>
          <button
            onClick={() => setEditing((e) => !e)}
            className="rounded-full bg-card px-3 py-1.5 text-xs font-bold shadow-sm transition-transform active:scale-95"
          >
            {editing ? "Done" : "Edit"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-card p-3">
            <p className="font-display text-2xl font-bold">{streak}</p>
            <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">Day streak</p>
          </div>
          <div className="rounded-xl bg-card p-3">
            <p className="font-display text-2xl font-bold">{totalLogged}</p>
            <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">Events logged</p>
          </div>
        </div>
      </div>

      {/* settings */}
      <p className="mt-5 mb-2 flex items-center gap-1.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">
        <Settings2 className="size-3.5" /> Settings
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-sky bg-sky/30 p-4">
          {profile.reminders ? <Bell className="size-5 shrink-0" /> : <BellOff className="size-5 shrink-0" />}
          <div className="flex-1">
            <p className="font-display text-base font-bold">Daily reminders</p>
            <p className="text-xs text-muted-foreground">Nudge me to finish today's plan.</p>
          </div>
          <Toggle on={profile.reminders} onClick={() => set("reminders", !profile.reminders)} label="Daily reminders" />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-mint bg-mint/30 p-4">
          <UserRound className="size-5 shrink-0" />
          <div className="flex-1">
            <p className="font-display text-base font-bold">Weekly progress report</p>
            <p className="text-xs text-muted-foreground">A Sunday summary of streaks and training balance.</p>
          </div>
          <Toggle on={profile.weeklyReport} onClick={() => set("weeklyReport", !profile.weeklyReport)} label="Weekly progress report" />
        </div>
      </div>

      {/* privacy */}
      <p className="mt-5 mb-2 flex items-center gap-1.5 text-xs font-bold tracking-widest text-muted-foreground uppercase">
        <ShieldCheck className="size-3.5" /> Privacy
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-peach bg-peach/30 p-4">
          {profile.privateProfile ? <EyeOff className="size-5 shrink-0" /> : <Eye className="size-5 shrink-0" />}
          <div className="flex-1">
            <p className="font-display text-base font-bold">Private profile</p>
            <p className="text-xs text-muted-foreground">Hide my stats and badges from teammates.</p>
          </div>
          <Toggle on={profile.privateProfile} onClick={() => set("privateProfile", !profile.privateProfile)} label="Private profile" />
        </div>
        <div className="rounded-2xl border-2 border-rose bg-rose/30 p-4">
          <p className="font-display text-base font-bold">Your data stays yours</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Everything you log is stored only on this device — nothing is shared or uploaded.
          </p>
          {confirmClear ? (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  onClearData();
                  setConfirmClear(false);
                }}
                className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground active:scale-95"
              >
                <Trash2 className="size-3.5" /> Yes, clear everything
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-full bg-card px-3 py-1.5 text-xs font-bold active:scale-95"
              >
                Keep my data
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="mt-3 flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-bold active:scale-95"
            >
              <Trash2 className="size-3.5" /> Clear my data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
