/**
 * Contact & directions.
 *
 * Emergency information comes first and is visually loud, because someone
 * arriving at this page in a hurry must not have to read past a contact form
 * to find a phone number.
 *
 * The message form is intentionally not a medical channel — it says so, and
 * routes clinical questions to the phone instead. A website form that quietly
 * accepts "my chest hurts" is a genuine safety problem.
 */

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle, Car, CheckCircle2, Clock, Loader2, Mail, MapPin, Phone, Send, Train,
} from "lucide-react";

import { BRAND } from "@/lib/brand";
import { soft } from "@/lib/motion";
import {
  Button, ButtonLink, Field, Input, Pill, Reveal, RevealGroup, RevealItem, Select, Textarea, SectionHead,
} from "@/components/ui";
import { ECGLine } from "@/components/vitals";

const DEPARTMENT_LINES = [
  { name: "Emergency", value: BRAND.emergencyPhone, note: "24 hours, every day", urgent: true },
  { name: "Switchboard", value: BRAND.phone, note: "24 hours" },
  { name: "Appointments", value: "+20 2 2405 9010", note: "Sat–Thu, 08:00–20:00" },
  { name: "Laboratory results", value: "+20 2 2405 9022", note: "Sat–Thu, 09:00–17:00" },
];

const HOURS = [
  { label: "Emergency", value: BRAND.hours.emergency },
  { label: "Outpatient clinics", value: BRAND.hours.clinics },
  { label: "Pharmacy", value: BRAND.hours.pharmacy },
  { label: "Visiting hours", value: "Daily, 16:00 – 20:00" },
];

export default function Contact() {
  const reduced = useReducedMotion();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "We need a name to reply to.";
    if (!form.email.trim()) next.email = "An email address, please.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = "Check the email address.";
    if (!form.message.trim()) next.message = "Tell us how we can help.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    setBusy(false);
    setSent(true);
  }

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  }

  return (
    <main className="relative overflow-hidden pt-28 pb-24">
      <div className="u-wrap relative z-10">
        <header className="max-w-2xl">
          <Pill tone="brand">Contact</Pill>
          <h1 className="mt-4 text-[clamp(34px,5.2vw,52px)]">Find us, call us, write to us</h1>
          <p className="mt-4 text-[16.5px] leading-relaxed text-ink-soft">
            We're on Al-Nasr Road in Nasr City, ten minutes from the ring road
            and a short walk from the metro.
          </p>
        </header>

        {/* ── Emergency banner ── */}
        <Reveal className="mt-10">
          <div className="flex flex-col items-start gap-4 rounded-3xl bg-coral p-7 text-white sm:flex-row sm:items-center">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20">
              <AlertTriangle size={24} />
            </span>
            <div className="flex-1">
              <h2 className="font-display text-[24px] text-white">In an emergency, call {BRAND.emergencyPhone}</h2>
              <p className="mt-1 text-[15px] text-white/85">
                Or come straight to the Emergency department — it never closes and
                you do not need an appointment.
              </p>
            </div>
            <ButtonLink href={`tel:${BRAND.emergencyPhone}`} tone="light" size="lg" external>
              <Phone size={18} /> Call now
            </ButtonLink>
          </div>
        </Reveal>

        {/* ── Lines & hours ── */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border border-line bg-white p-7">
              <h2 className="font-display text-[21px]">Direct lines</h2>
              <ul className="mt-5 divide-y divide-[color:var(--color-line)]">
                {DEPARTMENT_LINES.map((l) => (
                  <li key={l.name} className="flex items-center justify-between gap-4 py-3.5">
                    <div>
                      <div className="text-[14.5px] font-medium text-ink">{l.name}</div>
                      <div className="text-[12.5px] text-ink-faint">{l.note}</div>
                    </div>
                    <a
                      href={`tel:${l.value.replace(/\s/g, "")}`}
                      className={`u-tnum shrink-0 text-[14.5px] font-semibold hover:underline ${
                        l.urgent ? "text-coral" : "text-brand"
                      }`}
                    >
                      {l.value}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="h-full rounded-3xl border border-line bg-white p-7">
              <h2 className="font-display text-[21px]">Opening hours</h2>
              <ul className="mt-5 divide-y divide-[color:var(--color-line)]">
                {HOURS.map((h) => (
                  <li key={h.label} className="flex items-center justify-between gap-4 py-3.5">
                    <span className="flex items-center gap-2.5 text-[14.5px] font-medium text-ink">
                      <Clock size={15} className="text-brand" /> {h.label}
                    </span>
                    <span className="shrink-0 text-right text-[13.5px] text-ink-soft">{h.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* ── Getting here ── */}
        <section className="mt-20">
          <SectionHead eyebrow="Getting here" title="Al-Nasr Road, Nasr City" />

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
            <Reveal>
              {/* A styled placeholder rather than an embedded map: a third-party
                  map iframe is a tracking surface, and this page must load fast
                  for someone standing on a pavement. */}
              <div className="relative h-full min-h-[320px] overflow-hidden rounded-3xl border border-line bg-brand-deep">
                <div className="u-grid-lines absolute inset-0 opacity-40" />
                <div className="absolute inset-0 grid place-items-center p-8 text-center">
                  <div>
                    <motion.span
                      className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/15 text-white"
                      animate={reduced ? undefined : { y: [0, -8, 0] }}
                      transition={reduced ? undefined : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <MapPin size={26} />
                    </motion.span>
                    <p className="mt-5 font-display text-[22px] text-white">{BRAND.address}</p>
                    <p className="mt-1 text-[14px] text-white/60" dir="rtl">{BRAND.addressAr}</p>
                    <ButtonLink
                      href={`https://maps.google.com/?q=${encodeURIComponent(BRAND.address)}`}
                      tone="light" size="md" className="mt-6" external
                    >
                      Open in Maps
                    </ButtonLink>
                  </div>
                </div>
                <ECGLine className="absolute inset-x-0 bottom-0 h-14 w-full text-mint/50"
                  height={60} cycles={10} duration={5.5} />
              </div>
            </Reveal>

            <RevealGroup className="grid gap-3" each={0.07}>
              {[
                { icon: Car, title: "By car", text: "Free parking for 120 cars beneath the building. Entrance on the service road, signposted P." },
                { icon: Train, title: "By metro", text: "Line 3 to Stadium station, then an eight-minute walk north along Al-Nasr Road." },
                { icon: MapPin, title: "Drop-off", text: "A covered ambulance and drop-off bay sits directly outside Emergency." },
              ].map(({ icon: Icon, title, text }) => (
                <RevealItem key={title}>
                  <div className="rounded-3xl border border-line bg-white p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-wash text-brand">
                      <Icon size={19} />
                    </span>
                    <h3 className="mt-4 font-display text-[18px]">{title}</h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{text}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* ── Message form ── */}
        <section className="mt-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
            <SectionHead
              eyebrow="Write to us"
              title="Questions, feedback, complaints"
              lead="Answered within two working days. For anything clinical or urgent, please call instead — this form is not monitored around the clock."
            />

            <Reveal delay={0.08}>
              {sent ? (
                <motion.div
                  initial={reduced ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={soft(0.5)}
                  className="rounded-3xl border border-mint/30 bg-mint-wash p-9 text-center"
                >
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mint text-white">
                    <CheckCircle2 size={26} />
                  </span>
                  <h3 className="mt-5 font-display text-[24px]">Message sent</h3>
                  <p className="mx-auto mt-2 max-w-sm text-[15px] text-ink-soft">
                    Thank you, {form.name.split(" ")[0]}. We'll reply to{" "}
                    <strong className="text-ink">{form.email}</strong> within two working days.
                  </p>
                  <Button
                    tone="outline" size="md" className="mt-6"
                    onClick={() => { setSent(false); setForm({ name: "", email: "", topic: "", message: "" }); }}
                  >
                    Send another
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={submit} className="rounded-3xl border border-line bg-white p-7 sm:p-8">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Your name" required error={errors.name}>
                      <Input value={form.name} onChange={(e) => set("name", e.target.value)}
                        autoComplete="name" placeholder="Mona Abdelaziz" />
                    </Field>
                    <Field label="Email" required error={errors.email}>
                      <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                        autoComplete="email" placeholder="you@example.com" />
                    </Field>
                    <Field label="What is it about?" className="sm:col-span-2">
                      <Select value={form.topic} onChange={(e) => set("topic", e.target.value)}>
                        <option value="">Choose one</option>
                        <option>Feedback about a visit</option>
                        <option>A complaint</option>
                        <option>Billing or insurance</option>
                        <option>Medical records request</option>
                        <option>Working here</option>
                        <option>Something else</option>
                      </Select>
                    </Field>
                    <Field label="Message" required error={errors.message} className="sm:col-span-2">
                      <Textarea
                        value={form.message}
                        onChange={(e) => set("message", e.target.value)}
                        placeholder="How can we help?"
                        className="min-h-36"
                      />
                    </Field>
                  </div>

                  <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-coral-wash px-4 py-3">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0 text-coral" />
                    <p className="text-[13px] leading-relaxed text-ink-soft">
                      Please don't describe symptoms here. For medical advice call{" "}
                      <a href={`tel:${BRAND.phone}`} className="font-semibold text-coral hover:underline">
                        {BRAND.phone}
                      </a>
                      , or {BRAND.emergencyPhone} in an emergency.
                    </p>
                  </div>

                  <Button type="submit" tone="primary" size="lg" className="mt-5 w-full" disabled={busy}>
                    {busy ? (<><Loader2 size={17} className="animate-spin" /> Sending…</>)
                          : (<><Send size={16} /> Send message</>)}
                  </Button>

                  <p className="mt-4 flex items-center justify-center gap-2 text-[13px] text-ink-faint">
                    <Mail size={13} /> Or email {BRAND.email} directly
                  </p>
                </form>
              )}
            </Reveal>
          </div>
        </section>
      </div>
    </main>
  );
}
