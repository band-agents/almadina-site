/**
 * Sign in.
 *
 * The site does not authenticate anyone. It collects an identifier, then
 * hands off to the hospital information system, which owns sessions, roles
 * and the audit trail. That boundary is deliberate: a marketing site should
 * never be in the business of holding clinical credentials.
 *
 * The three tabs matter because the three audiences arrive with different
 * identifiers — a patient has a file number, a clinician has a staff ID —
 * and asking a patient for a "username" is how you lose them.
 */

import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, BriefcaseMedical, HeartPulse, Loader2, Lock, ShieldCheck, Stethoscope,
} from "lucide-react";

import { BRAND, signInUrl } from "@/lib/brand";
import { soft, springy } from "@/lib/motion";
import { Button, ButtonLink, Field, Input, PasswordInput, Pill, cx } from "@/components/ui";
import { BreathingCross, ECGLine, PulseRing } from "@/components/vitals";

type Tab = "patient" | "clinician" | "staff";

const TABS: Array<{
  id: Tab; label: string; icon: typeof HeartPulse;
  idLabel: string; idPlaceholder: string; idHint: string; blurb: string;
}> = [
  {
    id: "patient", label: "Patient", icon: HeartPulse,
    idLabel: "File number or mobile",
    idPlaceholder: "AMH-4821 or 01x xxxx xxxx",
    idHint: "Your file number is on any letter or receipt we've given you.",
    blurb: "Results, prescriptions, letters and your next appointment.",
  },
  {
    id: "clinician", label: "Doctor", icon: Stethoscope,
    idLabel: "Staff ID",
    idPlaceholder: "e.g. 10432",
    idHint: "The number on your hospital badge.",
    blurb: "Your clinic list, patient charts, orders and results to sign.",
  },
  {
    id: "staff", label: "Staff", icon: BriefcaseMedical,
    idLabel: "Work email",
    idPlaceholder: "you@almadinah-hospital.com",
    idHint: "Reception, nursing, pharmacy, laboratory and administration.",
    blurb: "The full hospital information system.",
  },
];

export default function Login() {
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<Tab>("patient");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const active = TABS.find((t) => t.id === tab)!;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(`Enter your ${active.idLabel.toLowerCase()}.`);
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setError(null);
    setBusy(true);
    // Hand off. The HIS takes it from here — this site never stores a session.
    window.location.href = signInUrl(tab);
  }

  return (
    <main className="relative min-h-svh overflow-hidden pt-24">
      {/* Split: brand panel on the left, form on the right. On mobile the
          panel collapses to a slim header so the form is above the fold. */}
      <div className="u-wrap grid items-stretch gap-8 py-12 lg:grid-cols-[1fr_460px] lg:gap-16 lg:py-20">

        {/* ── Brand side ── */}
        <div className="relative order-2 hidden overflow-hidden rounded-[36px] bg-brand-deep p-10 text-white lg:order-1 lg:block">
          <PulseRing size={520} color="rgba(255,255,255,0.14)" className="-left-24 top-1/3" />
          <div className="relative z-10 flex h-full flex-col">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
              <BreathingCross size={22} color="white" />
            </span>

            <h2 className="mt-8 font-display text-[clamp(28px,3.4vw,40px)] leading-tight text-white">
              Everything from your last visit, already open
            </h2>
            <p className="mt-4 max-w-sm text-[15.5px] leading-relaxed text-white/70">
              {active.blurb}
            </p>

            <ul className="mt-10 space-y-4">
              {[
                { icon: ShieldCheck, text: "Encrypted in transit and at rest" },
                { icon: Lock, text: "Only your care team can see your record" },
                { icon: HeartPulse, text: "Results appear the moment they're verified" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[14.5px] text-white/75">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10">
                    <Icon size={16} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-10">
              <p className="text-[13.5px] text-white/50">
                Trouble signing in? Call {BRAND.phone} and ask for the front desk.
              </p>
            </div>
          </div>

          <ECGLine className="absolute inset-x-0 bottom-0 h-20 w-full text-mint/60"
            height={80} cycles={10} duration={5} />
        </div>

        {/* ── Form side ── */}
        <div className="order-1 lg:order-2">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={soft(0.7)}
            className="rounded-[32px] border border-line bg-white p-7 shadow-[0_30px_80px_-60px_rgba(11,63,117,0.9)] sm:p-9"
          >
            <div className="text-center">
              <Pill tone="brand">Secure sign-in</Pill>
              <h1 className="mt-4 text-[30px]">Welcome back</h1>
              <p className="mt-2 text-[14.5px] text-ink-soft">
                Choose how you're signing in.
              </p>
            </div>

            {/* Tabs — the pill slides between them rather than blinking. */}
            <div role="tablist" aria-label="Sign in as"
              className="mt-7 grid grid-cols-3 gap-1 rounded-2xl bg-surface p-1">
              {TABS.map((t) => {
                const selected = tab === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={selected}
                    onClick={() => { setTab(t.id); setError(null); }}
                    className={cx(
                      "relative flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13.5px] font-semibold transition-colors",
                      selected ? "text-white" : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {selected && (
                      <motion.span
                        layoutId="login-tab"
                        className="absolute inset-0 rounded-xl bg-brand"
                        transition={springy}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <t.icon size={14} /> {t.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
              {/* Swapping tabs re-labels the identifier, so animate the change
                  or it looks like the form glitched. */}
              {/* Keyed rather than mode="wait" — see the note in Book.tsx.
                  The identifier field must never be withheld on a tween. */}
              <motion.div
                key={tab}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={soft(0.25)}
              >
                  <Field label={active.idLabel} hint={active.idHint} required>
                    <Input
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value); setError(null); }}
                      placeholder={active.idPlaceholder}
                      autoComplete="username"
                      autoFocus
                    />
                  </Field>
              </motion.div>

              <Field label="Password" required>
                <PasswordInput
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </Field>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-ink-soft">
                  <input type="checkbox" className="h-4 w-4 rounded border-line accent-[var(--color-brand)]" />
                  Keep me signed in
                </label>
                <a href={`${BRAND.hisUrl}/auth`} className="text-[13.5px] font-semibold text-brand hover:underline">
                  Forgot password?
                </a>
              </div>

              {error && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  transition={soft(0.25)}
                  className="rounded-xl bg-coral-wash px-4 py-3 text-[13.5px] font-medium text-coral"
                >
                  {error}
                </motion.p>
              )}

              <Button type="submit" tone="primary" size="lg" className="mt-1 w-full" disabled={busy}>
                {busy ? (
                  <><Loader2 size={17} className="animate-spin" /> Taking you through…</>
                ) : (
                  <>Sign in <ArrowRight size={17} /></>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-[13.5px] text-ink-soft">
              No account yet?{" "}
              <Link href="/book" asChild>
                <a className="font-semibold text-brand hover:underline">Book a first appointment</a>
              </Link>{" "}
              — we'll create your file at the desk.
            </p>
          </motion.div>

          <p className="mt-5 text-center text-[12.5px] leading-relaxed text-ink-faint">
            Signing in takes you to the {BRAND.name} information system.
            This website never stores your password.
          </p>

          <div className="mt-6 text-center lg:hidden">
            <ButtonLink href="/" tone="ghost" size="sm">Back to the website</ButtonLink>
          </div>
        </div>
      </div>
    </main>
  );
}
