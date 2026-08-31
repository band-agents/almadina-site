/**
 * Appointment booking.
 *
 * Four steps rather than one long form, because the questions genuinely
 * depend on each other: which consultants exist depends on the department,
 * and which slots exist depends on the consultant and the day.
 *
 * Decisions worth keeping:
 *
 *  - **You can always go back, and nothing is lost.** State lives in one
 *    object at the top; steps only read and write it. Going back to change a
 *    department keeps your name and phone number.
 *
 *  - **Validation is per-step and on submit, never on keystroke.** Being told
 *    your email is invalid while you are still typing the third character is
 *    the most disliked pattern in form design. Errors clear as soon as the
 *    field changes, so a correction feels immediate.
 *
 *  - **The step can be deep-linked.** `/book?department=cardiology` from a
 *    department card lands on step 2 with the choice already made.
 *
 *  - **Slots are generated deterministically from the date**, so the same day
 *    always offers the same grid. A random grid that reshuffles on re-render
 *    makes a form feel broken.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CalendarCheck, Check, Clock, Loader2, Phone, Sparkles, User,
} from "lucide-react";

import { BRAND } from "@/lib/brand";
import { DEPARTMENTS, DOCTORS, departmentById, doctorsForDepartment } from "@/data/hospital";
import { soft, springy } from "@/lib/motion";
import {
  Avatar, Button, ButtonLink, ChoiceCard, Field, Input, Pill, Select, Textarea, cx,
} from "@/components/ui";
import { ECGLine, PulseRing } from "@/components/vitals";

/* ── Model ───────────────────────────────────────────────── */

interface Draft {
  departmentId: string;
  doctorId: string;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  nationalId: string;
  visitType: "first" | "follow-up";
  insurer: string;
  notes: string;
}

const EMPTY: Draft = {
  departmentId: "", doctorId: "", date: "", time: "",
  firstName: "", lastName: "", phone: "", email: "", nationalId: "",
  visitType: "first", insurer: "", notes: "",
};

type Errors = Partial<Record<keyof Draft, string>>;

const STEPS = [
  { n: 1, label: "Department" },
  { n: 2, label: "Consultant" },
  { n: 3, label: "Date & time" },
  { n: 4, label: "Your details" },
] as const;

/* ── Slot generation ─────────────────────────────────────── */

/** Clinic runs 09:00–17:00 on the half hour. */
const ALL_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const minutes = 9 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

/**
 * Which slots are taken, derived from the date and doctor so the grid is
 * stable across renders. A real deployment replaces this with the HIS's
 * scheduling read; the shape stays the same.
 */
function bookedSlots(dateISO: string, doctorId: string): Set<string> {
  let seed = 0;
  for (const ch of dateISO + doctorId) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const taken = new Set<string>();
  for (let i = 0; i < ALL_SLOTS.length; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    if (seed % 100 < 42) taken.add(ALL_SLOTS[i]);
  }
  return taken;
}

/**
 * A calendar day as YYYY-MM-DD in the *visitor's* timezone.
 *
 * Deliberately not `toISOString().slice(0, 10)`: that converts to UTC first,
 * so local midnight in Cairo (UTC+3) becomes 21:00 the previous day and the
 * booking is stored one day earlier than the one the patient tapped. The
 * chip said "Tue 1 Sep" and the confirmation said "Monday 31 August".
 */
function localISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Parse a localISO string back to a Date at local midnight. */
function fromLocalISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** The next 14 selectable days, skipping Friday (the clinics' closed day). */
function upcomingDays(count = 14) {
  const out: Array<{ iso: string; weekday: string; day: string; month: string }> = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1); // earliest is tomorrow
  while (out.length < count) {
    if (cursor.getDay() !== 5) {
      out.push({
        iso: localISO(cursor),
        weekday: cursor.toLocaleDateString("en-GB", { weekday: "short" }),
        day: String(cursor.getDate()),
        month: cursor.toLocaleDateString("en-GB", { month: "short" }),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

/* ── Validation ──────────────────────────────────────────── */

/**
 * Egyptian mobile numbers.
 *
 * Accepts all three forms people actually type:
 *   01012345678     national, with the trunk 0 — the form the field asks for
 *   +201012345678   international
 *   201012345678    international without the plus
 *
 * The trunk 0 is dropped in the international form, which is why it is
 * optional rather than simply required. An earlier version required the
 * number to begin with 1, which rejected every number written the way the
 * placeholder asks for it — the field and its validator disagreed.
 */
const PHONE_RE = /^(?:\+?20|0)?1[0125][0-9]{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateStep(step: number, d: Draft): Errors {
  const e: Errors = {};
  if (step === 1 && !d.departmentId) e.departmentId = "Choose a department to continue.";
  if (step === 2 && !d.doctorId) e.doctorId = "Choose a consultant, or pick the first available.";
  if (step === 3) {
    if (!d.date) e.date = "Pick a day.";
    else if (!d.time) e.time = "Pick a time.";
  }
  if (step === 4) {
    if (!d.firstName.trim()) e.firstName = "We need a first name.";
    if (!d.lastName.trim()) e.lastName = "We need a last name.";
    if (!d.phone.trim()) e.phone = "A mobile number is how we confirm.";
    else if (!PHONE_RE.test(d.phone.replace(/[\s-]/g, ""))) e.phone = "That doesn't look like an Egyptian mobile number.";
    if (d.email.trim() && !EMAIL_RE.test(d.email.trim())) e.email = "Check the email address.";
    if (d.nationalId.trim() && !/^\d{14}$/.test(d.nationalId.trim()))
      e.nationalId = "A national ID is 14 digits.";
  }
  return e;
}

/* ── Progress rail ───────────────────────────────────────── */

function Progress({ step, onJump }: { step: number; onJump: (n: number) => void }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-3" aria-label="Booking progress">
      {STEPS.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <li key={s.n} className="flex flex-1 items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={() => done && onJump(s.n)}
              disabled={!done}
              aria-current={active ? "step" : undefined}
              className={cx(
                "flex items-center gap-2 whitespace-nowrap rounded-full py-1 pl-1 pr-1 sm:pr-3 text-[13px] font-semibold transition-colors",
                done && "cursor-pointer text-brand hover:bg-brand-wash",
                active && "text-ink",
                !done && !active && "text-ink-faint",
              )}
            >
              <motion.span
                className={cx(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px]",
                  done ? "bg-brand text-white" : active ? "bg-brand text-white" : "bg-black/6 text-ink-faint",
                )}
                animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={springy}
              >
                {done ? <Check size={13} strokeWidth={3} /> : s.n}
              </motion.span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <span className="h-px flex-1 overflow-hidden bg-line">
                <motion.span
                  className="block h-full w-full origin-left bg-brand"
                  initial={false}
                  animate={{ scaleX: step > s.n ? 1 : 0 }}
                  transition={soft(0.45)}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function Book() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => upcomingDays(), []);
  const doctors = draft.departmentId ? doctorsForDepartment(draft.departmentId) : [];
  const department = departmentById(draft.departmentId);
  const doctor = DOCTORS.find((d) => d.id === draft.doctorId);
  const taken = draft.date && draft.doctorId ? bookedSlots(draft.date, draft.doctorId) : new Set<string>();

  /* Deep links from department cards and doctor cards. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dep = params.get("department");
    const doc = params.get("doctor");

    if (doc) {
      const found = DOCTORS.find((d) => d.id === doc);
      if (found) {
        setDraft((d) => ({ ...d, departmentId: found.departmentId, doctorId: found.id }));
        setStep(3);
        return;
      }
    }
    if (dep && departmentById(dep)) {
      setDraft((d) => ({ ...d, departmentId: dep }));
      setStep(2);
    }
  }, []);

  /* Moving between steps should put the reader at the top of the panel, not
     leave them mid-page wondering what changed. */
  useEffect(() => {
    if (step === 1) return;
    panelRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [step, reduced]);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    // Clearing on change is what makes a correction feel instant.
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function next() {
    const found = validateStep(step, draft);
    setErrors(found);
    if (Object.keys(found).length === 0) setStep((s) => Math.min(4, s + 1));
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    const found = validateStep(4, draft);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    // Stands in for the HIS scheduling write. The reference format matches
    // the system's own patient-facing code prefix.
    await new Promise((r) => setTimeout(r, 1100));
    const stamp = Date.now().toString(36).toUpperCase().slice(-6);
    setReference(`AMH-${stamp.slice(0, 3)}-${stamp.slice(3)}`);
    setSubmitting(false);
  }

  /* ── Confirmation ── */
  if (reference) {
    return (
      <main className="relative min-h-[80svh] overflow-hidden pt-32 pb-24">
        <PulseRing size={520} color="var(--color-mint)" className="left-1/2 top-32 -translate-x-1/2" />
        <div className="u-wrap-narrow relative z-10">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={soft(0.7)}
            className="rounded-[32px] border border-line bg-white p-8 text-center sm:p-12"
          >
            <motion.span
              className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint text-white"
              initial={reduced ? false : { scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...springy, delay: 0.15 }}
            >
              <CalendarCheck size={28} />
            </motion.span>

            <h1 className="mt-6 text-[clamp(28px,4vw,38px)]">You're booked</h1>
            <p className="mt-3 text-[16px] text-ink-soft">
              A confirmation is on its way to <strong className="text-ink">{draft.phone}</strong>.
              Bring your ID and any previous scans.
            </p>

            <div className="mt-8 rounded-2xl bg-surface p-6 text-left">
              <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                Reference
              </div>
              <div className="u-tnum mt-1 font-display text-[26px] text-brand">{reference}</div>

              <dl className="mt-5 grid gap-3 border-t border-line pt-5 text-[14.5px] sm:grid-cols-2">
                <div>
                  <dt className="text-ink-faint">Department</dt>
                  <dd className="font-medium text-ink">{department?.name}</dd>
                </div>
                <div>
                  <dt className="text-ink-faint">Consultant</dt>
                  <dd className="font-medium text-ink">{doctor?.name ?? "First available"}</dd>
                </div>
                <div>
                  <dt className="text-ink-faint">When</dt>
                  <dd className="u-tnum font-medium text-ink">
                    {fromLocalISO(draft.date).toLocaleDateString("en-GB", {
                      weekday: "long", day: "numeric", month: "long",
                    })}{" "}
                    at {draft.time}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-faint">Patient</dt>
                  <dd className="font-medium text-ink">{draft.firstName} {draft.lastName}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/login" tone="primary" size="lg">
                Track it in your portal <ArrowRight size={17} />
              </ButtonLink>
              <Button
                tone="outline"
                size="lg"
                onClick={() => { setReference(null); setDraft(EMPTY); setStep(1); }}
              >
                Book another
              </Button>
            </div>

            <p className="mt-7 text-[13.5px] text-ink-faint">
              Need to change it? Call {BRAND.phone} — quoting the reference is enough.
            </p>
          </motion.div>
        </div>
      </main>
    );
  }

  /* ── Form ── */
  return (
    <main className="relative overflow-hidden pt-28 pb-24">
      <div className="u-wrap relative z-10">
        <header className="max-w-2xl">
          <Pill tone="brand"><Sparkles size={12} /> About a minute</Pill>
          <h1 className="mt-4 text-[clamp(34px,5.2vw,52px)]">Book an appointment</h1>
          <p className="mt-4 text-[16.5px] leading-relaxed text-ink-soft">
            Four short steps. Nothing is charged here, and you can change or
            cancel any time by phone.
          </p>
        </header>

        <div className="mt-10 rounded-[32px] border border-line bg-white p-5 shadow-[0_30px_80px_-60px_rgba(11,63,117,0.9)] sm:p-8">
          <Progress step={step} onJump={setStep} />

          <div ref={panelRef} className="scroll-mt-28 pt-8">
            {/* A keyed motion.div, NOT AnimatePresence with mode="wait".
                mode="wait" holds the next step until the previous one's exit
                animation has finished — and if that tween is ever interrupted
                (a background tab throttling rAF is how this surfaced) the form
                is stuck showing a step the user already completed. Re-keying
                swaps the content synchronously and animates the new step in,
                so nothing can gate it. */}
            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, x: 26 }}
              animate={{ opacity: 1, x: 0 }}
              transition={soft(0.4)}
            >
                {/* ── 1 · Department ── */}
                {step === 1 && (
                  <section aria-labelledby="s1">
                    <h2 id="s1" className="font-display text-[24px]">Which department?</h2>
                    <p className="mt-1.5 text-[14.5px] text-ink-soft">
                      Not sure? Choose General Surgery or call {BRAND.phone} and we'll point you.
                    </p>
                    <div role="radiogroup" aria-label="Department"
                      className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {DEPARTMENTS.map(({ id, name, nameAr, icon: Icon, alwaysOpen }) => (
                        <ChoiceCard
                          key={id}
                          selected={draft.departmentId === id}
                          onSelect={() => { set("departmentId", id); set("doctorId", ""); }}
                        >
                          <div className="flex items-center gap-3 pr-6">
                            <span className={cx(
                              "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors",
                              draft.departmentId === id ? "bg-brand text-white" : "bg-brand-wash text-brand",
                            )}>
                              <Icon size={18} />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[14.5px] font-semibold text-ink">{name}</span>
                              <span className="block truncate text-[12.5px] text-ink-faint" dir="rtl">{nameAr}</span>
                            </span>
                          </div>
                          {alwaysOpen && (
                            <span className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-mint">
                              <Clock size={11} /> Open 24 hours
                            </span>
                          )}
                        </ChoiceCard>
                      ))}
                    </div>
                    {errors.departmentId && (
                      <p role="alert" className="mt-4 text-[13px] font-medium text-coral">{errors.departmentId}</p>
                    )}
                  </section>
                )}

                {/* ── 2 · Consultant ── */}
                {step === 2 && (
                  <section aria-labelledby="s2">
                    <h2 id="s2" className="font-display text-[24px]">Who would you like to see?</h2>
                    <p className="mt-1.5 text-[14.5px] text-ink-soft">
                      {department?.name} · {doctors.length} consultant{doctors.length === 1 ? "" : "s"} available
                    </p>

                    <div role="radiogroup" aria-label="Consultant" className="mt-6 grid gap-2.5 sm:grid-cols-2">
                      <ChoiceCard
                        selected={draft.doctorId === "any"}
                        onSelect={() => set("doctorId", "any")}
                      >
                        <div className="flex items-center gap-3 pr-6">
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint-wash text-mint">
                            <Sparkles size={19} />
                          </span>
                          <span>
                            <span className="block text-[15px] font-semibold text-ink">First available</span>
                            <span className="block text-[13px] text-ink-soft">Usually the soonest slot</span>
                          </span>
                        </div>
                      </ChoiceCard>

                      {doctors.map((d) => (
                        <ChoiceCard
                          key={d.id}
                          selected={draft.doctorId === d.id}
                          onSelect={() => set("doctorId", d.id)}
                        >
                          <div className="flex items-center gap-3 pr-6">
                            <Avatar initials={d.initials} accent={d.accent} size={48} />
                            <span className="min-w-0">
                              <span className="block truncate text-[15px] font-semibold text-ink">{d.name}</span>
                              <span className="block truncate text-[13px] text-ink-soft">{d.focus}</span>
                              <span className="mt-1 block text-[12px] text-ink-faint">
                                Clinics: {d.days.join(" · ")}
                              </span>
                            </span>
                          </div>
                        </ChoiceCard>
                      ))}
                    </div>
                    {errors.doctorId && (
                      <p role="alert" className="mt-4 text-[13px] font-medium text-coral">{errors.doctorId}</p>
                    )}
                  </section>
                )}

                {/* ── 3 · Date & time ── */}
                {step === 3 && (
                  <section aria-labelledby="s3">
                    <h2 id="s3" className="font-display text-[24px]">When suits you?</h2>
                    <p className="mt-1.5 text-[14.5px] text-ink-soft">
                      Clinics run Saturday to Thursday. Greyed-out times are already taken.
                    </p>

                    <div className="mt-6">
                      <h3 className="text-[13px] font-semibold text-ink">Day</h3>
                      <div
                        role="radiogroup" aria-label="Day"
                        className="mt-3 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      >
                        {days.map((d) => {
                          const selected = draft.date === d.iso;
                          return (
                            <motion.button
                              key={d.iso}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => { set("date", d.iso); set("time", ""); }}
                              whileHover={reduced ? undefined : { y: -3 }}
                              whileTap={reduced ? undefined : { scale: 0.97 }}
                              transition={springy}
                              className={cx(
                                "flex w-[68px] shrink-0 flex-col items-center rounded-2xl border py-3 transition-colors",
                                selected
                                  ? "border-brand bg-brand text-white"
                                  : "border-line bg-white text-ink hover:border-brand/40",
                              )}
                            >
                              <span className={cx("text-[11.5px] font-medium",
                                selected ? "text-white/75" : "text-ink-faint")}>
                                {d.weekday}
                              </span>
                              <span className="u-tnum mt-0.5 font-display text-[21px] leading-none">{d.day}</span>
                              <span className={cx("mt-1 text-[11px]",
                                selected ? "text-white/75" : "text-ink-faint")}>
                                {d.month}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                      {errors.date && (
                        <p role="alert" className="mt-2 text-[13px] font-medium text-coral">{errors.date}</p>
                      )}
                    </div>

                    <AnimatePresence>
                      {draft.date && (
                        <motion.div
                          initial={reduced ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={soft(0.4)}
                          className="overflow-hidden"
                        >
                          <div className="mt-7">
                            <h3 className="text-[13px] font-semibold text-ink">Time</h3>
                            <div role="radiogroup" aria-label="Time"
                              className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                              {ALL_SLOTS.map((slot) => {
                                const isTaken = taken.has(slot);
                                const selected = draft.time === slot;
                                return (
                                  <motion.button
                                    key={slot}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    disabled={isTaken}
                                    onClick={() => set("time", slot)}
                                    whileHover={reduced || isTaken ? undefined : { y: -2 }}
                                    whileTap={reduced || isTaken ? undefined : { scale: 0.97 }}
                                    transition={springy}
                                    className={cx(
                                      "u-tnum rounded-xl border py-2.5 text-[14px] font-medium transition-colors",
                                      isTaken && "cursor-not-allowed border-line/60 bg-black/[0.03] text-ink-faint/50 line-through",
                                      !isTaken && selected && "border-brand bg-brand text-white",
                                      !isTaken && !selected && "border-line bg-white text-ink hover:border-brand/45",
                                    )}
                                  >
                                    {slot}
                                  </motion.button>
                                );
                              })}
                            </div>
                            {errors.time && (
                              <p role="alert" className="mt-2 text-[13px] font-medium text-coral">{errors.time}</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>
                )}

                {/* ── 4 · Details ── */}
                {step === 4 && (
                  <section aria-labelledby="s4">
                    <h2 id="s4" className="font-display text-[24px]">Who is the appointment for?</h2>
                    <p className="mt-1.5 text-[14.5px] text-ink-soft">
                      Only the first three are required. Everything else helps us prepare.
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <Field label="First name" required error={errors.firstName}>
                        <Input
                          value={draft.firstName}
                          onChange={(e) => set("firstName", e.target.value)}
                          autoComplete="given-name"
                          placeholder="Mona"
                        />
                      </Field>
                      <Field label="Last name" required error={errors.lastName}>
                        <Input
                          value={draft.lastName}
                          onChange={(e) => set("lastName", e.target.value)}
                          autoComplete="family-name"
                          placeholder="Abdelaziz"
                        />
                      </Field>
                      <Field label="Mobile number" required error={errors.phone}
                        hint="We send the confirmation and the reminder here.">
                        <Input
                          value={draft.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="01x xxxx xxxx"
                          className="u-tnum"
                        />
                      </Field>
                      <Field label="Email" error={errors.email}>
                        <Input
                          type="email"
                          value={draft.email}
                          onChange={(e) => set("email", e.target.value)}
                          autoComplete="email"
                          placeholder="you@example.com"
                        />
                      </Field>
                      <Field label="National ID" error={errors.nationalId}
                        hint="Speeds up registration at the desk.">
                        <Input
                          value={draft.nationalId}
                          onChange={(e) => set("nationalId", e.target.value)}
                          inputMode="numeric"
                          maxLength={14}
                          placeholder="14 digits"
                          className="u-tnum"
                        />
                      </Field>
                      <Field label="Insurance">
                        <Select value={draft.insurer} onChange={(e) => set("insurer", e.target.value)}>
                          <option value="">Paying myself</option>
                          <option>Misr Insurance</option>
                          <option>AXA Egypt</option>
                          <option>MetLife</option>
                          <option>Allianz</option>
                          <option>Other / employer scheme</option>
                        </Select>
                      </Field>

                      <Field label="Type of visit" className="sm:col-span-2">
                        <div className="flex gap-2">
                          {(["first", "follow-up"] as const).map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => set("visitType", v)}
                              className={cx(
                                "flex-1 rounded-2xl border py-3 text-[14px] font-medium capitalize transition-colors",
                                draft.visitType === v
                                  ? "border-brand bg-brand-wash text-brand"
                                  : "border-line bg-white text-ink-soft hover:border-brand/40",
                              )}
                            >
                              {v === "first" ? "First visit" : "Follow-up"}
                            </button>
                          ))}
                        </div>
                      </Field>

                      <Field label="Anything we should know?" className="sm:col-span-2"
                        hint="Symptoms, current medication, or access needs.">
                        <Textarea
                          value={draft.notes}
                          onChange={(e) => set("notes", e.target.value)}
                          placeholder="Optional — a sentence is plenty."
                        />
                      </Field>
                    </div>

                    {/* Summary so the last click is never a leap of faith. */}
                    <div className="mt-7 rounded-2xl bg-surface p-5">
                      <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                        You're booking
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14.5px]">
                        <span className="flex items-center gap-2 font-medium text-ink">
                          {department && <department.icon size={15} className="text-brand" />}
                          {department?.name}
                        </span>
                        <span className="flex items-center gap-2 text-ink">
                          <User size={15} className="text-brand" />
                          {doctor?.name ?? "First available"}
                        </span>
                        <span className="u-tnum flex items-center gap-2 text-ink">
                          <Clock size={15} className="text-brand" />
                          {draft.date &&
                            fromLocalISO(draft.date).toLocaleDateString("en-GB", {
                              weekday: "short", day: "numeric", month: "short",
                            })}{" "}
                          · {draft.time}
                        </span>
                      </div>
                    </div>
                  </section>
                )}
            </motion.div>
          </div>

          {/* ── Controls ── */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            <Button tone="ghost" size="md" onClick={back} disabled={step === 1}>
              <ArrowLeft size={16} /> Back
            </Button>

            {step < 4 ? (
              <Button tone="primary" size="lg" onClick={next}>
                Continue <ArrowRight size={17} />
              </Button>
            ) : (
              <Button tone="primary" size="lg" onClick={submit} disabled={submitting}>
                {submitting ? (
                  <><Loader2 size={17} className="animate-spin" /> Confirming…</>
                ) : (
                  <><CalendarCheck size={17} /> Confirm booking</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Emergency escape hatch — someone who should not be filling in a form. */}
        <div className="mt-6 flex flex-col items-start gap-3 rounded-3xl border border-coral/25 bg-coral-wash p-6 sm:flex-row sm:items-center">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-coral text-white">
            <Phone size={19} />
          </span>
          <div className="flex-1">
            <h3 className="text-[15.5px] font-semibold text-ink">If this is an emergency, don't book</h3>
            <p className="mt-0.5 text-[14px] text-ink-soft">
              Call {BRAND.emergencyPhone} or come straight to the Emergency department. It never closes.
            </p>
          </div>
          <ButtonLink href={`tel:${BRAND.emergencyPhone}`} tone="coral" size="md" external>
            Call {BRAND.emergencyPhone}
          </ButtonLink>
        </div>
      </div>

      <ECGLine className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-brand/12"
        height={90} cycles={16} duration={7} />
    </main>
  );
}
