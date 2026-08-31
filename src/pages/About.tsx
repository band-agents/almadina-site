/**
 * About us.
 *
 * A hospital's about page has one job: make a stranger believe the place is
 * competent and will treat them decently. So it leads with what is measurable
 * (numbers, accreditation, what happens on a visit) and keeps the mission
 * language short — a paragraph of adjectives persuades nobody.
 */

import { Link } from "wouter";
import {
  Award, Building2, HeartHandshake, Languages, Leaf, Microscope, ShieldCheck, Users,
} from "lucide-react";

import { BRAND } from "@/lib/brand";
import { STATS } from "@/data/hospital";
import {
  ButtonLink, Pill, Reveal, RevealGroup, RevealItem, SectionHead,
} from "@/components/ui";
import { CountUp, ECGLine, FloatingField, PulseRing } from "@/components/vitals";

const VALUES = [
  { icon: HeartHandshake, title: "Explained, not announced",
    text: "Every plan is explained until it is understood — in Arabic or English, to you and to whoever you bring." },
  { icon: ShieldCheck, title: "Safety we can prove",
    text: "Incidents are reviewed monthly and outcomes published internally. Nothing is buried." },
  { icon: Users, title: "One team per patient",
    text: "A named nurse through each shift, and follow-ups with the consultant who saw you first." },
  { icon: Microscope, title: "Diagnostics on site",
    text: "Imaging, pathology and theatres in the same building, so a diagnosis does not take three trips." },
  { icon: Languages, title: "Bilingual by default",
    text: "Signage, consent forms and your portal all work in Arabic and English." },
  { icon: Leaf, title: "Built to be calm",
    text: "Daylight on every ward, single rooms in maternity, and a paediatric floor that does not feel clinical." },
];

const TIMELINE = [
  { year: "1998", title: "Opened as a twelve-bed clinic", text: "One theatre, four doctors, on the same street corner we occupy today." },
  { year: "2006", title: "Emergency department opened", text: "The first around-the-clock service in the district." },
  { year: "2014", title: "Maternity and neonatal wing", text: "Delivery suites and a level-two neonatal unit on one floor." },
  { year: "2021", title: "Imaging centre", text: "MRI, CT and mammography brought on site, ending referrals across the city." },
  { year: "2026", title: "Al-Madinah Hospital", text: "A new name, a new information system, and a portal that puts your record in your hand." },
];

const ACCREDITATION = [
  "Egyptian Ministry of Health licensed",
  "GAHAR accredited, 2024",
  "ISO 9001 quality management",
  "Joint Commission preparation, 2027",
];

export default function About() {
  return (
    <main className="relative overflow-hidden pt-28">
      {/* ── Intro ── */}
      <section className="u-aurora relative pb-20">
        <FloatingField
          items={[
            { Icon: Building2, x: "5%", y: "20%", size: 24 },
            { Icon: Award, x: "91%", y: "30%", size: 22, delay: 1.1 },
          ]}
        />
        <div className="u-wrap relative z-10">
          <header className="max-w-3xl">
            <Pill tone="brand">Since 1998</Pill>
            <h1 className="mt-4 text-[clamp(34px,5.6vw,58px)]">
              A neighbourhood hospital that grew up
            </h1>
            <p className="mt-5 text-[17.5px] leading-[1.75] text-ink-soft">
              {BRAND.name} began as a twelve-bed clinic on Al-Nasr Road. Twenty-eight
              years later it is a 180-bed general hospital with twelve departments —
              and it is still on the same corner, treating the families of the people
              who walked in first.
            </p>
            <p className="mt-4 text-[16px] leading-[1.75] text-ink-soft">
              We are not the largest hospital in Cairo and have never tried to be.
              What we hold ourselves to is narrower: that you are seen quickly, told
              the truth, and treated by someone whose name you know.
            </p>
          </header>
        </div>
      </section>

      {/* ── Numbers ── */}
      <section className="relative overflow-hidden bg-brand-deep py-20 text-white">
        <PulseRing size={560} color="rgba(255,255,255,0.14)" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="u-wrap relative z-10">
          <RevealGroup className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4" each={0.08}>
            {STATS.map((s) => (
              <RevealItem key={s.label}>
                <div className="border-t border-white/18 pt-5">
                  <div className="font-display text-[clamp(34px,4.4vw,50px)] leading-none">
                    <CountUp value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-3 text-[14.5px] font-medium text-white/85">{s.label}</div>
                  <div className="mt-1 text-[13px] text-white/50">{s.hint}</div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
        <ECGLine className="absolute inset-x-0 bottom-0 h-16 w-full text-mint/50" height={70} cycles={13} duration={6} />
      </section>

      {/* ── Values ── */}
      <section className="py-24">
        <div className="u-wrap">
          <SectionHead
            eyebrow="How we work"
            title="Six commitments, written down"
            lead="Kept short deliberately. A promise you can check is worth more than a page of mission statement."
          />
          <RevealGroup className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" each={0.06}>
            {VALUES.map(({ icon: Icon, title, text }) => (
              <RevealItem key={title}>
                <div className="flex h-full flex-col rounded-3xl border border-line bg-white p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-wash text-brand">
                    <Icon size={19} />
                  </span>
                  <h3 className="mt-5 font-display text-[19px]">{title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{text}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="bg-white py-24">
        <div className="u-wrap">
          <SectionHead eyebrow="How we got here" title="Twenty-eight years, five turning points" />

          <RevealGroup className="mt-12 space-y-0" each={0.08}>
            {TIMELINE.map((t, i) => (
              <RevealItem key={t.year}>
                <div className="grid gap-4 border-t border-line py-7 md:grid-cols-[130px_1fr] md:gap-10">
                  <div className="u-tnum font-display text-[26px] text-brand">{t.year}</div>
                  <div>
                    <h3 className="font-display text-[21px]">{t.title}</h3>
                    <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{t.text}</p>
                  </div>
                </div>
                {i === TIMELINE.length - 1 && <div className="border-t border-line" />}
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Accreditation ── */}
      <section className="py-24">
        <div className="u-wrap">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <SectionHead
              eyebrow="Licensing"
              title="Checked by people who don't work for us"
              lead="Accreditation is an outside opinion on whether a hospital does what it says. We publish ours."
            />
            <Reveal delay={0.1}>
              <ul className="grid gap-2.5">
                {ACCREDITATION.map((a) => (
                  <li key={a} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4">
                    <Award size={17} className="shrink-0 text-mint" />
                    <span className="text-[14.5px] font-medium text-ink">{a}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-8">
        <div className="u-wrap">
          <Reveal className="relative overflow-hidden rounded-[32px] bg-brand p-10 text-center text-white sm:p-14">
            <PulseRing size={420} color="rgba(255,255,255,0.18)" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10">
              <h2 className="mx-auto max-w-xl font-display text-[clamp(26px,3.6vw,38px)] text-white">
                Come and judge it for yourself
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[15.5px] text-white/75">
                Book a consultation, or ask the front desk for a walk through the
                department you'd be treated in. We say yes to that.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/book" tone="light" size="lg">Book an appointment</ButtonLink>
                <Link href="/contact" asChild>
                  <a className="inline-flex h-[52px] items-center rounded-full px-7 text-[15px] font-semibold text-white/80 hover:text-white">
                    Find us →
                  </a>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
