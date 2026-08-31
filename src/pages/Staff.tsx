/**
 * Leadership.
 *
 * Separate from /doctors on purpose: a patient looking for a cardiologist and
 * a journalist looking for the medical director want different pages, and
 * merging them serves neither.
 */

import {
  Building2, GraduationCap, HeartPulse, Mail, Microscope, Sparkles, Users,
} from "lucide-react";

import { BRAND } from "@/lib/brand";
import { LEADERSHIP } from "@/data/hospital";
import {
  Avatar, ButtonLink, Pill, Reveal, RevealGroup, RevealItem, SectionHead,
} from "@/components/ui";
import { CountUp, FloatingField } from "@/components/vitals";

const TEAMS = [
  { icon: HeartPulse, label: "Consultants", value: 42, suffix: "", note: "Across twelve specialties" },
  { icon: Users, label: "Nurses", value: 210, suffix: "+", note: "Named nurse per shift" },
  { icon: Microscope, label: "Allied health", value: 68, suffix: "", note: "Lab, imaging, physio, pharmacy" },
  { icon: Building2, label: "Support staff", value: 95, suffix: "", note: "Reception, catering, estates" },
];

const CAREERS = [
  { title: "Specialist Registrar — Emergency", type: "Full time", dept: "Emergency" },
  { title: "Staff Nurse — Maternity", type: "Full time", dept: "Maternity" },
  { title: "Radiographer (MRI)", type: "Full time", dept: "Imaging" },
  { title: "Clinical Pharmacist", type: "Part time", dept: "Pharmacy" },
];

export default function Staff() {
  return (
    <main className="relative overflow-hidden pt-28 pb-24">
      <FloatingField
        items={[
          { Icon: Sparkles, x: "6%", y: "14%", size: 22 },
          { Icon: GraduationCap, x: "90%", y: "22%", size: 24, delay: 1.3 },
        ]}
      />

      <div className="u-wrap relative z-10">
        <header className="max-w-2xl">
          <Pill tone="brand">Leadership</Pill>
          <h1 className="mt-4 text-[clamp(34px,5.2vw,52px)]">The people accountable</h1>
          <p className="mt-4 text-[16.5px] leading-relaxed text-ink-soft">
            Six names, and what each of them answers for. If something goes wrong
            in your care, one of these people owns it.
          </p>
        </header>

        {/* ── Leadership ── */}
        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" each={0.07}>
          {LEADERSHIP.map((m) => (
            <RevealItem key={m.id}>
              <article className="flex h-full flex-col rounded-3xl border border-line bg-white p-7">
                <Avatar initials={m.initials} accent={m.accent} size={62} />
                <h2 className="mt-5 font-display text-[20px] leading-snug">{m.name}</h2>
                <p className="mt-1 text-[13.5px] font-semibold text-brand">{m.role}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">{m.blurb}</p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      {/* ── Team sizes ── */}
      <section className="mt-24 bg-white py-20">
        <div className="u-wrap">
          <SectionHead
            eyebrow="The wider team"
            title="Four hundred and fifteen people"
            lead="A hospital is mostly the people you never learn the name of. Here is roughly who is in the building on a weekday."
          />
          <RevealGroup className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" each={0.07}>
            {TEAMS.map(({ icon: Icon, label, value, suffix, note }) => (
              <RevealItem key={label}>
                <div className="rounded-3xl border border-line bg-surface p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-wash text-brand">
                    <Icon size={19} />
                  </span>
                  <div className="mt-5 font-display text-[36px] leading-none text-ink">
                    <CountUp value={value} suffix={suffix} />
                  </div>
                  <div className="mt-2 text-[14.5px] font-medium text-ink">{label}</div>
                  <div className="mt-0.5 text-[13px] text-ink-faint">{note}</div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Careers ── */}
      <section className="py-24">
        <div className="u-wrap">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <SectionHead
              eyebrow="Working here"
              title="We're hiring, carefully"
              lead="Four open posts. We would rather leave a role vacant for a month than fill it with someone who is not right for a ward."
            />

            <Reveal delay={0.1}>
              <ul className="divide-y divide-[color:var(--color-line)] overflow-hidden rounded-3xl border border-line bg-white">
                {CAREERS.map((c) => (
                  <li key={c.title}>
                    <a
                      href={`mailto:${BRAND.email}?subject=${encodeURIComponent("Application — " + c.title)}`}
                      className="group flex items-center gap-4 p-5 transition-colors hover:bg-surface"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15.5px] font-semibold text-ink">{c.title}</h3>
                        <p className="mt-0.5 text-[13px] text-ink-faint">{c.dept} · {c.type}</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-brand/25 px-4 py-2 text-[13px] font-semibold
                                       text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                        Apply
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-brand-wash px-5 py-4">
                <Mail size={17} className="shrink-0 text-brand" />
                <p className="text-[14px] text-ink-soft">
                  Nothing that fits? Send a CV to{" "}
                  <a href={`mailto:${BRAND.email}`} className="font-semibold text-brand hover:underline">
                    {BRAND.email}
                  </a>{" "}
                  — we keep them for a year.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="u-wrap">
        <Reveal className="rounded-[32px] border border-line bg-white p-10 text-center sm:p-14">
          <h2 className="mx-auto max-w-xl font-display text-[clamp(26px,3.4vw,36px)]">
            Looking for a consultant instead?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15.5px] text-ink-soft">
            The full list of doctors, what they treat and when they hold clinic.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/doctors" tone="primary" size="lg">Find a doctor</ButtonLink>
            <ButtonLink href="/book" tone="outline" size="lg">Book an appointment</ButtonLink>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
